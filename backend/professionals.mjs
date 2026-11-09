// Professional (worker) side of the Nearby Professionals feature:
//  - authenticated professional accounts and device location updates
//  - nearby discovery with accurate great-circle distances
//  - booking-scoped live location sharing that needs consent from both parties
//
// All routes are registered onto the existing Express app from createApp() in
// index.mjs so the shared pool, auth helpers, rate limiters and error shape are
// reused rather than duplicated.

import {
  haversineMeters,
  distancePayload,
  coordinateError,
  accuracyError,
  locationFreshness,
} from './geo.mjs';

const SHARING_DEFAULT_TTL_MS = 4 * 60 * 60 * 1000;
const ACTIVE_ASSIGNMENT_STATUSES = ['assigned', 'confirmed', 'in_progress'];
const TRACKABLE_BOOKING_STATUSES = ['confirmed', 'in_progress'];
const NEARBY_DEFAULT_RADIUS_KM = 10;
const NEARBY_MAX_RADIUS_KM = 50;
const NEARBY_RESULT_LIMIT = 60;
const ADDIS_WEEKDAY = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function addisTimeParts(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Addis_Ababa', year: 'numeric', month: '2-digit', day: '2-digit',
    weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date).map(part => [part.type, part.value]));
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    weekday: ADDIS_WEEKDAY[parts.weekday],
    time: `${parts.hour}:${parts.minute}:00`,
  };
}

export function registerProfessionalRoutes(app, deps) {
  const {
    pool,
    apiError,
    asyncRoute,
    createRateLimit,
    signToken,
    verifyToken,
    customerClaims,
    writeCookie,
    clearCookie,
    passwordHash,
    passwordMatches,
    normalizedPhone,
    publicLimit,
  } = deps;

  const professionalLoginLimit = createRateLimit(10, 15 * 60 * 1000);
  const locationUpdateLimit = createRateLimit(240, 5 * 60 * 1000);
  const sharingUpdateLimit = createRateLimit(240, 5 * 60 * 1000);
  const nearbyLimit = createRateLimit(120, 10 * 60 * 1000);
  const sharingReadLimit = createRateLimit(120, 60 * 1000);

  // ---------------------------------------------------------------------------
  // Identity
  // ---------------------------------------------------------------------------

  function workerClaims(req) {
    const bearer = /^Bearer\s+(.+)$/i.exec(req.get('Authorization') || '')?.[1];
    return verifyToken(bearer || cookieValue(req, 'meraki_worker_session'), 'worker');
  }

  function cookieValue(req, name) {
    const pair = (req.headers.cookie || '').split(';').map(value => value.trim()).find(value => value.startsWith(`${name}=`));
    return pair ? decodeURIComponent(pair.slice(name.length + 1)) : '';
  }

  /** Resolves the signed-in professional, or null when the caller is not one. */
  async function signedInProfessional(req) {
    const claims = workerClaims(req);
    if (!claims) return null;
    const { rows } = await pool.query(
      `SELECT w.id, w.full_name AS name, w.worker_code AS "workerCode", w.photo_url AS "photoUrl",
              w.service_area AS "serviceArea", w.operational_status AS "operationalStatus",
              w.eligibility_status AS "eligibilityStatus", w.latitude, w.longitude,
              w.location_accuracy_meters AS "locationAccuracyMeters",
              w.location_updated_at AS "locationUpdatedAt",
              w.location_sharing_enabled AS "locationSharingEnabled",
              a.is_active AS "credentialActive"
         FROM workers w JOIN worker_auth a ON a.worker_id = w.id
        WHERE w.id = $1`,
      [claims.sub],
    );
    return rows[0] ?? null;
  }

  /** Requires a signed-in, active, eligible professional. */
  const workerAuth = asyncRoute(async (req, res, next) => {
    const professional = await signedInProfessional(req);
    if (!professional || !professional.credentialActive) return apiError(res, 401, 'Professional sign-in is required.');
    if (professional.operationalStatus !== 'active' || professional.eligibilityStatus !== 'eligible') {
      return apiError(res, 403, 'This professional account is not currently eligible to share location.');
    }
    req.professional = professional;
    next();
  });

  function publicProfessional(professional) {
    const freshness = locationFreshness(professional.locationUpdatedAt);
    const hasPosition = professional.latitude !== null && professional.longitude !== null;
    // Precise coordinates are only exposed when the professional opted in and the
    // fix is not stale. Otherwise the marker is placed nowhere rather than at a
    // guess, and the client falls back to the list.
    const visible = hasPosition && professional.locationSharingEnabled === true && ['live', 'recent'].includes(freshness);
    return {
      latitude: visible ? Number(professional.latitude) : null,
      longitude: visible ? Number(professional.longitude) : null,
      accuracyMeters: visible && professional.locationAccuracyMeters !== null ? Number(professional.locationAccuracyMeters) : null,
      locationVisible: visible,
      locationFreshness: freshness,
      locationUpdatedAt: professional.locationUpdatedAt ?? null,
    };
  }

  app.post('/api/professionals/auth/login', professionalLoginLimit, asyncRoute(async (req, res) => {
    const phone = normalizedPhone(req.body?.phone);
    const password = req.body?.password;
    if (phone.length < 9 || phone.length > 15 || typeof password !== 'string') {
      return apiError(res, 400, 'Enter the phone number registered with Meraki and your password.');
    }
    const { rows } = await pool.query(
      `SELECT w.id, w.full_name AS name, w.worker_code AS "workerCode", a.password_hash, w.operational_status, w.eligibility_status
         FROM worker_auth a JOIN workers w ON w.id = a.worker_id
        WHERE regexp_replace(a.phone, '[^0-9]', '', 'g') = $1`,
      [phone],
    );
    const account = rows[0];
    if (!account || !passwordMatches(password, account.password_hash)) {
      return apiError(res, 401, 'Phone number or password is incorrect.');
    }
    if (account.operational_status !== 'active' || account.eligibility_status !== 'eligible') {
      return apiError(res, 403, 'This professional account is not currently active. Contact Meraki Operations.');
    }
    const token = signToken('worker', account.id);
    writeCookie(res, 'meraki_worker_session', token);
    res.json({ professional: { id: account.id, name: account.name, workerCode: account.workerCode }, accessToken: token });
  }));

  app.post('/api/professionals/auth/logout', (_req, res) => {
    clearCookie(res, 'meraki_worker_session');
    res.status(204).end();
  });

  app.get('/api/professionals/me', workerAuth, asyncRoute(async (req, res) => {
    const professional = req.professional;
    res.json({
      professional: {
        id: professional.id,
        name: professional.name,
        workerCode: professional.workerCode,
        photoUrl: professional.photoUrl,
        serviceArea: professional.serviceArea,
        locationSharingEnabled: professional.locationSharingEnabled === true,
        ...publicProfessional(professional),
      },
    });
  }));

  app.get('/api/professionals/me/bookings', workerAuth, asyncRoute(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT DISTINCT b.id AS "bookingId", b.reference, b.status,
              b.customer_name_snapshot AS "customerName", b.requested_start AS "requestedStart",
              bi.id AS "itemId", bi.service_name_snapshot AS "serviceName",
              ba.assignment_status AS "assignmentStatus"
         FROM booking_assignments ba
         JOIN bookings b ON b.id = ba.booking_id
         JOIN booking_items bi ON bi.id = ba.booking_item_id
        WHERE ba.worker_id = $1 AND ba.assignment_status = ANY($2::text[])
          AND b.status = ANY($3::text[])
        ORDER BY b.requested_start DESC`,
      [req.professional.id, ACTIVE_ASSIGNMENT_STATUSES, TRACKABLE_BOOKING_STATUSES],
    );
    res.json({ bookings: rows });
  }));

  // ---------------------------------------------------------------------------
  // Professional location updates
  // ---------------------------------------------------------------------------

  app.patch('/api/professionals/me/location-settings', workerAuth, asyncRoute(async (req, res) => {
    const shareLocation = req.body?.shareLocation;
    if (typeof shareLocation !== 'boolean') return apiError(res, 400, 'Send shareLocation as true or false.');
    const { rows } = await pool.query(
      `UPDATE workers SET location_sharing_enabled = $2,
              latitude = CASE WHEN $2 THEN latitude ELSE NULL END,
              longitude = CASE WHEN $2 THEN longitude ELSE NULL END,
              location_accuracy_meters = CASE WHEN $2 THEN location_accuracy_meters ELSE NULL END,
              location_updated_at = CASE WHEN $2 THEN location_updated_at ELSE NULL END,
              location_source = CASE WHEN $2 THEN location_source ELSE NULL END,
              updated_at = now()
        WHERE id = $1
        RETURNING location_sharing_enabled AS "locationSharingEnabled",
                  latitude, longitude, location_accuracy_meters AS "locationAccuracyMeters",
                  location_updated_at AS "locationUpdatedAt"`,
      [req.professional.id, shareLocation],
    );
    res.json({ locationSharingEnabled: rows[0].locationSharingEnabled, ...publicProfessional(rows[0]) });
  }));

  app.post('/api/professionals/me/location', workerAuth, locationUpdateLimit, asyncRoute(async (req, res) => {
    const latitude = req.body?.latitude;
    const longitude = req.body?.longitude;
    const accuracyMeters = req.body?.accuracyMeters ?? null;

    const coordinateProblem = coordinateError(latitude, longitude, { required: true });
    if (coordinateProblem) return apiError(res, 400, coordinateProblem);
    const accuracyProblem = accuracyError(accuracyMeters);
    if (accuracyProblem) return apiError(res, 400, accuracyProblem);

    // A professional can only ever write their own row: the id comes from the
    // verified token, never from the request body.
    const { rows } = await pool.query(
      `UPDATE workers SET latitude = $2, longitude = $3, location_accuracy_meters = $4,
              location_updated_at = now(), location_source = 'device', updated_at = now()
        WHERE id = $1 AND operational_status = 'active' AND eligibility_status = 'eligible' AND location_sharing_enabled = TRUE
        RETURNING latitude, longitude, location_accuracy_meters AS "locationAccuracyMeters",
                  location_updated_at AS "locationUpdatedAt",
                  location_sharing_enabled AS "locationSharingEnabled"`,
      [req.professional.id, Number(latitude), Number(longitude), accuracyMeters === null ? null : Number(accuracyMeters)],
    );
    if (!rows.length) return apiError(res, 403, 'This professional account cannot update its location.');
    res.json({ location: publicProfessional(rows[0]) });
  }));
// ---------------------------------------------------------------------------
  // Nearby discovery
  // ---------------------------------------------------------------------------

  function availabilityOf(row) {
    if (row.busy) return 'busy';
    if (row.scheduled) return 'available';
    if (row.hasSchedule) return 'busy';
    return 'needs_confirmation';
  }

  function parseNearbyFilters(query) {
    const filterErrors = [];
    const latitude = query.latitude === undefined || query.latitude === '' ? null : query.latitude;
    const longitude = query.longitude === undefined || query.longitude === '' ? null : query.longitude;
    const coordinateProblem = coordinateError(latitude, longitude, { required: true });
    if (coordinateProblem) filterErrors.push(coordinateProblem);

    const serviceId = typeof query.serviceId === 'string' && query.serviceId.trim() ? query.serviceId.trim() : null;
    if (serviceId && serviceId.length > 80) filterErrors.push('Choose a valid service.');

    let radiusKm = NEARBY_DEFAULT_RADIUS_KM;
    if (query.radiusKm !== undefined && query.radiusKm !== '') {
      const value = Number(query.radiusKm);
      if (!Number.isFinite(value) || value < 1 || value > NEARBY_MAX_RADIUS_KM) {
        filterErrors.push(`Radius must be between 1 and ${NEARBY_MAX_RADIUS_KM} km.`);
      } else {
        radiusKm = value;
      }
    }

    let minRating = null;
    if (query.minRating !== undefined && query.minRating !== '') {
      const value = Number(query.minRating);
      if (!Number.isFinite(value) || value < 0 || value > 5) filterErrors.push('Minimum rating must be between 0 and 5.');
      else minRating = value;
    }

    let maxRate = null;
    if (query.maxRate !== undefined && query.maxRate !== '') {
      const value = Number(query.maxRate);
      if (!Number.isFinite(value) || value < 0) filterErrors.push('Maximum rate must be zero or more.');
      else maxRate = value;
    }

    if (query.availableOnly !== undefined && !['true', 'false', true, false].includes(query.availableOnly)) filterErrors.push('Availability filter must be true or false.');
    const availableOnly = query.availableOnly === 'true' || query.availableOnly === true;
    if (query.sort !== undefined && !['distance', 'rating', 'price'].includes(query.sort)) filterErrors.push('Choose distance, rating, or price sorting.');
    const sorting = query.sort || 'distance';

    return {
      errors: filterErrors,
      latitude: coordinateProblem ? null : Number(latitude),
      longitude: coordinateProblem ? null : Number(longitude),
      serviceId,
      radiusKm,
      minRating,
      maxRate,
      availableOnly,
      sorting,
      hasLocationFilter: !coordinateProblem,
    };
  }

  app.get('/api/professionals/nearby', nearbyLimit, asyncRoute(async (req, res) => {
    const filters = parseNearbyFilters(req.query);
    if (filters.errors.length) return apiError(res, 400, filters.errors[0]);

    if (req.query.requestedStart !== undefined
      && (typeof req.query.requestedStart !== 'string' || !Number.isFinite(Date.parse(req.query.requestedStart)))) {
      return apiError(res, 400, 'Choose a valid preferred time.');
    }
    const requestedStartAt = typeof req.query.requestedStart === 'string'
      ? new Date(req.query.requestedStart)
      : new Date(Date.now() + 60 * 60 * 1000);
    if (requestedStartAt.getTime() <= Date.now()) return apiError(res, 400, 'Choose a preferred time in the future.');

    const parts = addisTimeParts(requestedStartAt.toISOString());
    if (!parts) return apiError(res, 400, 'Choose a valid preferred time.');

    let durationMinutes = 60;
    if (filters.serviceId) {
      const service = await pool.query('SELECT estimated_duration_minutes FROM services WHERE id = $1 AND is_active = TRUE', [filters.serviceId]);
      if (!service.rowCount) return apiError(res, 404, 'This service is unavailable.');
      durationMinutes = service.rows[0].estimated_duration_minutes;
    }

    const { rows } = await pool.query(
      `SELECT w.id, w.worker_code AS "workerCode", w.full_name AS name, w.photo_url AS "photoUrl",
              w.service_area AS "serviceArea", w.latitude, w.longitude,
              w.location_accuracy_meters AS "locationAccuracyMeters",
              w.location_updated_at AS "locationUpdatedAt",
              w.location_sharing_enabled AS "locationSharingEnabled",
              w.base_rate AS "baseRate", w.rate_currency AS "rateCurrency",
              w.rating, w.review_count AS "reviewCount", w.is_demo AS "isDemo",
              COALESCE(array_agg(DISTINCT ws.service_id) FILTER (WHERE ws.service_id IS NOT NULL), '{}') AS "serviceIds",
              COALESCE(array_agg(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL), '{}') AS services,
              COALESCE(array_agg(DISTINCT ws.qualification_name) FILTER (WHERE ws.qualification_name <> ''), '{}') AS skills,
              EXISTS(SELECT 1 FROM worker_availability a
                      WHERE a.worker_id = w.id
                        AND (a.specific_date = $2::date OR (a.specific_date IS NULL AND a.weekday = $3))
                        AND a.start_time <= $4::time
                        AND ($4::time + make_interval(mins => $5)) >= $4::time
                        AND a.end_time >= ($4::time + make_interval(mins => $5))) AS scheduled,
              EXISTS(SELECT 1 FROM worker_availability a
                      WHERE a.worker_id = w.id
                        AND (a.specific_date = $2::date OR (a.specific_date IS NULL AND a.weekday = $3))) AS "hasSchedule",
              (EXISTS(SELECT 1 FROM worker_unavailability u
                       WHERE u.worker_id = w.id
                         AND u.starts_at < $6::timestamptz + make_interval(mins => $5)
                         AND u.ends_at > $6::timestamptz)
               OR EXISTS(SELECT 1 FROM booking_assignments ba
                           JOIN booking_items bi ON bi.id = ba.booking_item_id
                          WHERE ba.worker_id = w.id
                            AND ba.assignment_status IN ('assigned','confirmed','in_progress')
                            AND COALESCE(bi.confirmed_start_at, bi.preferred_start_at) < $6::timestamptz + make_interval(mins => $5)
                            AND COALESCE(bi.confirmed_end_at, bi.preferred_start_at + make_interval(mins => bi.estimated_duration_minutes)) > $6::timestamptz)
               OR EXISTS(SELECT 1 FROM worker_reservations r
                          WHERE r.worker_id = w.id
                            AND r.reservation_status IN ('active','confirmed')
                            AND (r.expires_at IS NULL OR r.expires_at > now())
                            AND r.starts_at < $6::timestamptz + make_interval(mins => $5)
                            AND r.ends_at > $6::timestamptz)) AS busy
         FROM workers w
         JOIN worker_services ws ON ws.worker_id = w.id AND ws.qualification_status = 'verified'
         JOIN services s ON s.id = ws.service_id AND s.is_active = TRUE
        WHERE w.operational_status = 'active'
          AND w.eligibility_status = 'eligible'
          AND w.is_demo = FALSE
          AND ($1::text IS NULL OR ws.service_id = $1)
          AND NOT EXISTS (SELECT 1 FROM service_skill_requirements req
                           WHERE req.service_id = ws.service_id
                             AND req.is_mandatory
                             AND NOT EXISTS (SELECT 1 FROM worker_skills skill
                                              WHERE skill.worker_id = w.id
                                                AND skill.skill_id = req.skill_id
                                                AND skill.verification_status = 'verified'
                                                AND (skill.valid_until IS NULL OR skill.valid_until >= CURRENT_DATE)))
        GROUP BY w.id`,
      [filters.serviceId, parts.date, parts.weekday, parts.time, durationMinutes, requestedStartAt.toISOString()],
    );

    const professionals = [];
    for (const row of rows) {
      const availability = availabilityOf(row);
      const rating = row.rating === null ? null : Number(row.rating);
      const baseRate = row.baseRate === null ? null : Number(row.baseRate);
      const position = publicProfessional(row);
      // Discovery is distance based, so only professionals who explicitly share a
      // recent, usable position can be included in the selected radius.
      if (filters.hasLocationFilter && !position.locationVisible) continue;
      const meters = filters.hasLocationFilter ? haversineMeters(filters.latitude, filters.longitude, row.latitude, row.longitude) : null;
      const distance = distancePayload(meters);
      if (filters.hasLocationFilter && (meters === null || meters > filters.radiusKm * 1000)) continue;
      if (filters.availableOnly && availability !== 'available') continue;
      if (filters.minRating !== null && (rating === null || rating < filters.minRating)) continue;
      if (filters.maxRate !== null && (baseRate === null || baseRate > filters.maxRate)) continue;

      professionals.push({
        id: row.id,
        name: row.name,
        photoUrl: row.photoUrl,
        serviceArea: row.serviceArea,
        services: row.services,
        serviceIds: row.serviceIds,
        skills: row.skills,
        baseRate,
        rateCurrency: row.rateCurrency?.trim() ?? null,
        rating,
        reviewCount: row.reviewCount,
        isDemo: row.isDemo,
        availability,
        ...position,
        distanceMeters: distance.distanceMeters,
        distanceKm: distance.distanceKm,
        distanceLabel: distance.distanceLabel,
        distanceKind: distance.distanceKind,
      });
    }

    const sorters = {
      distance: (a, b) => (a.distanceMeters ?? Number.MAX_SAFE_INTEGER) - (b.distanceMeters ?? Number.MAX_SAFE_INTEGER)
        || (b.rating ?? 0) - (a.rating ?? 0),
      rating: (a, b) => (b.rating ?? -1) - (a.rating ?? -1) || (a.distanceMeters ?? Number.MAX_SAFE_INTEGER) - (b.distanceMeters ?? Number.MAX_SAFE_INTEGER),
      price: (a, b) => (a.baseRate ?? Number.MAX_SAFE_INTEGER) - (b.baseRate ?? Number.MAX_SAFE_INTEGER)
        || (a.distanceMeters ?? Number.MAX_SAFE_INTEGER) - (b.distanceMeters ?? Number.MAX_SAFE_INTEGER),
    };
    professionals.sort(sorters[filters.sorting]);
    const limited = professionals.slice(0, NEARBY_RESULT_LIMIT);

    res.json({
      professionals: limited,
      total: professionals.length,
      returned: limited.length,
      center: filters.hasLocationFilter ? { latitude: filters.latitude, longitude: filters.longitude } : null,
      radiusKm: filters.radiusKm,
      requestedStart: requestedStartAt.toISOString(),
      sort: filters.sorting,
      distanceKind: 'straight_line',
      availabilitySource: limited.some(item => item.isDemo) ? 'demo schedules and assignments' : 'configured schedules and assignments',
      demoData: limited.some(item => item.isDemo),
    });
  }));

  // Registered after /nearby so the literal path wins over the :id parameter.
  app.get('/api/professionals/:id', publicLimit, asyncRoute(async (req, res) => {
    const id = String(req.params.id);
    if (!/^[0-9a-f-]{36}$/i.test(id)) return apiError(res, 404, 'Professional not found.');

    const { rows } = await pool.query(
      `SELECT w.id, w.worker_code AS "workerCode", w.full_name AS name, w.photo_url AS "photoUrl",
              w.service_area AS "serviceArea", w.latitude, w.longitude,
              w.location_accuracy_meters AS "locationAccuracyMeters",
              w.location_updated_at AS "locationUpdatedAt",
              w.location_sharing_enabled AS "locationSharingEnabled",
              w.base_rate AS "baseRate", w.rate_currency AS "rateCurrency",
              w.rating, w.review_count AS "reviewCount", w.is_demo AS "isDemo",
              COALESCE(array_agg(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL), '{}') AS services,
              COALESCE(array_agg(DISTINCT ws.service_id) FILTER (WHERE ws.service_id IS NOT NULL), '{}') AS "serviceIds",
              COALESCE(array_agg(DISTINCT ws.qualification_name) FILTER (WHERE ws.qualification_name <> ''), '{}') AS skills
         FROM workers w
         LEFT JOIN worker_services ws ON ws.worker_id = w.id AND ws.qualification_status = 'verified'
         LEFT JOIN services s ON s.id = ws.service_id AND s.is_active = TRUE
        WHERE w.id = $1 AND w.operational_status = 'active' AND w.eligibility_status = 'eligible' AND w.is_demo = FALSE
        GROUP BY w.id`,
      [id],
    );
    const row = rows[0];
    if (!row) return apiError(res, 404, 'Professional not found.');

    const position = publicProfessional(row);
    const latitude = req.query.latitude === undefined ? null : Number(req.query.latitude);
    const longitude = req.query.longitude === undefined ? null : Number(req.query.longitude);
    const meters = coordinateError(req.query.latitude, req.query.longitude) === null && latitude !== null && longitude !== null
      ? haversineMeters(latitude, longitude, row.latitude, row.longitude)
      : null;
    const distance = distancePayload(position.locationFreshness === 'stale' ? null : meters);

    // Public profile only: no phone, no email, no private address, no account rows.
    res.json({
      professional: {
        id: row.id,
        workerCode: row.workerCode,
        name: row.name,
        photoUrl: row.photoUrl,
        serviceArea: row.serviceArea,
        services: row.services,
        serviceIds: row.serviceIds,
        skills: row.skills,
        rating: row.rating === null ? null : Number(row.rating),
        reviewCount: row.reviewCount,
        baseRate: row.baseRate === null ? null : Number(row.baseRate),
        rateCurrency: row.rateCurrency?.trim() ?? null,
        isDemo: row.isDemo,
        verified: true,
        ...position,
        ...distance,
      },
    });
  }));
// ---------------------------------------------------------------------------
  // Booking-scoped live location sharing (requires consent from both parties)
  // ---------------------------------------------------------------------------

  const CONSENT_TTL_MS = 30 * 60 * 1000;

  const SESSION_COLUMNS = `
    id, booking_id AS "bookingId", worker_id AS "workerId", status,
    customer_consent_at AS "customerConsentAt", professional_consent_at AS "professionalConsentAt",
    started_at AS "startedAt", stopped_at AS "stoppedAt", stop_reason AS "stopReason",
    expires_at AS "expiresAt",
    worker_latitude AS "workerLatitude", worker_longitude AS "workerLongitude",
    worker_accuracy_meters AS "workerAccuracyMeters", worker_location_updated_at AS "workerLocationUpdatedAt",
    customer_latitude AS "customerLatitude", customer_longitude AS "customerLongitude",
    customer_accuracy_meters AS "customerAccuracyMeters", customer_location_updated_at AS "customerLocationUpdatedAt"`;

  async function resolveSharingActor(req) {
    const professional = await signedInProfessional(req);
    if (professional && professional.credentialActive
      && professional.operationalStatus === 'active' && professional.eligibilityStatus === 'eligible') {
      return { workerId: professional.id, name: professional.name, isProfessional: true };
    }
    const claims = customerClaims(req);
    if (claims) {
      const { rows } = await pool.query("SELECT id, full_name AS name FROM customers WHERE id = $1 AND account_status = 'active'", [claims.sub]);
      if (rows[0]) return { customerId: rows[0].id, name: rows[0].name, isProfessional: false };
    }
    return null;
  }

  async function loadBookingParties(bookingId, actor) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookingId)) {
      return { error: [404, 'Booking not found.'] };
    }
    const { rows } = await pool.query(
      'SELECT id, reference, status, customer_id AS "customerId" FROM bookings WHERE id = $1',
      [bookingId],
    );
    const booking = rows[0];
    // Cross-account probing must not reveal whether a booking exists.
    if (!booking) return { error: [404, 'Booking not found.'] };
    if (actor.customerId && booking.customerId !== actor.customerId) return { error: [404, 'Booking not found.'] };

    const assigned = await pool.query(
      `SELECT DISTINCT ba.worker_id AS "workerId", w.full_name AS "workerName"
         FROM booking_assignments ba JOIN workers w ON w.id = ba.worker_id
        WHERE ba.booking_id = $1 AND ba.assignment_status = ANY($2::text[])`,
      [bookingId, ACTIVE_ASSIGNMENT_STATUSES],
    );
    const assignedWorkerIds = assigned.rows.map(row => row.workerId);
    if (actor.workerId && !assignedWorkerIds.includes(actor.workerId)) return { error: [404, 'Booking not found.'] };
    if (!actor.customerId && !actor.workerId) return { error: [401, 'Sign in to manage live location sharing.'] };

    return { booking, assigned: assigned.rows, assignedWorkerIds };
  }

  async function markSessionStopped(sessionId, reason) {
    const status = reason === 'expired' ? 'expired' : 'stopped';
    const { rows } = await pool.query(
      `UPDATE booking_location_sharing
          SET status = $2, stopped_at = now(), stop_reason = $3,
              worker_latitude = NULL, worker_longitude = NULL, worker_accuracy_meters = NULL, worker_location_updated_at = NULL,
              customer_latitude = NULL, customer_longitude = NULL, customer_accuracy_meters = NULL, customer_location_updated_at = NULL,
              updated_at = now()
        WHERE id = $1 AND status IN ('pending_customer_consent','pending_professional_consent','active')
        RETURNING ${SESSION_COLUMNS}`,
      [sessionId, status, reason],
    );
    return rows[0] ?? null;
  }

  /**
   * Applies expiry, booking-status and assignment rules to a session. Any breach
   * permanently stops the session so later reads and updates are rejected.
   */
  async function enforceSessionLifecycle(session, booking, assignedWorkerIds) {
    if (!['pending_customer_consent', 'pending_professional_consent', 'active'].includes(session.status)) return session;

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      return (await markSessionStopped(session.id, 'expired')) ?? session;
    }
    if (!TRACKABLE_BOOKING_STATUSES.includes(booking.status)) {
      const reason = booking.status === 'cancelled' ? 'booking_cancelled'
        : booking.status === 'completed' ? 'booking_completed' : 'booking_not_active';
      return (await markSessionStopped(session.id, reason)) ?? session;
    }
    if (!assignedWorkerIds.includes(session.workerId)) {
      return (await markSessionStopped(session.id, 'assignment_changed')) ?? session;
    }
    return session;
  }

  function positionView(latitude, longitude, accuracyMeters, updatedAt) {
    if (latitude === null || longitude === null) return null;
    return {
      latitude: Number(latitude),
      longitude: Number(longitude),
      accuracyMeters: accuracyMeters === null ? null : Number(accuracyMeters),
      updatedAt,
      freshness: locationFreshness(updatedAt),
    };
  }

  function sessionView(session, actor, workerName) {
    const isCustomer = !actor.isProfessional;
    const active = session.status === 'active';
    // Each side only ever receives the other side's position, and only while the
    // session is active. Pending consent reveals nothing.
    const counterpart = active
      ? (isCustomer
        ? positionView(session.workerLatitude, session.workerLongitude, session.workerAccuracyMeters, session.workerLocationUpdatedAt)
        : positionView(session.customerLatitude, session.customerLongitude, session.customerAccuracyMeters, session.customerLocationUpdatedAt))
      : null;
    const counterpartUpdatedAt = active
      ? (isCustomer ? session.workerLocationUpdatedAt : session.customerLocationUpdatedAt)
      : null;

    return {
      id: session.id,
      workerId: session.workerId,
      workerName: workerName ?? null,
      status: session.status,
      customerConsented: session.customerConsentAt !== null,
      professionalConsented: session.professionalConsentAt !== null,
      counterpartParty: isCustomer ? 'professional' : 'customer',
      counterpart,
      counterpartLastUpdate: counterpartUpdatedAt,
      expiresAt: session.expiresAt,
      startedAt: session.startedAt,
      stoppedAt: session.stoppedAt,
      stopReason: session.stopReason,
      canSharePosition: active,
    };
  }

  /** Resolves which professional a session belongs to, for the calling party. */
  function targetWorkerId(actor, bodyWorkerId, assignedWorkerIds) {
    if (actor.workerId) return actor.workerId;
    if (typeof bodyWorkerId === 'string' && assignedWorkerIds.includes(bodyWorkerId)) return bodyWorkerId;
    if (assignedWorkerIds.length === 1) return assignedWorkerIds[0];
    return null;
  }

  app.get('/api/bookings/:bookingId/location-sharing', sharingReadLimit, asyncRoute(async (req, res) => {
    const actor = await resolveSharingActor(req);
    if (!actor) return apiError(res, 401, 'Sign in to view live location sharing.');
    const parties = await loadBookingParties(req.params.bookingId, actor);
    if (parties.error) return apiError(res, parties.error[0], parties.error[1]);

    const { rows } = await pool.query(
      `SELECT ${SESSION_COLUMNS} FROM booking_location_sharing
        WHERE booking_id = $1 AND ($2::uuid IS NULL OR worker_id = $2)
        ORDER BY created_at DESC LIMIT 20`,
      [parties.booking.id, actor.workerId ?? null],
    );
    const nameByWorker = new Map(parties.assigned.map(row => [row.workerId, row.workerName]));

    const sessions = [];
    for (const row of rows) {
      const live = await enforceSessionLifecycle(row, parties.booking, parties.assignedWorkerIds);
      sessions.push(sessionView(live, actor, nameByWorker.get(live.workerId)));
    }

    const trackable = TRACKABLE_BOOKING_STATUSES.includes(parties.booking.status) && parties.assignedWorkerIds.length > 0;
    res.json({
      bookingId: parties.booking.id,
      bookingReference: parties.booking.reference,
      bookingStatus: parties.booking.status,
      trackable,
      sessions,
      assignedProfessionals: parties.assigned.map(row => ({ workerId: row.workerId, name: row.workerName })),
      notice: trackable
        ? 'Live location starts only after both you and the assigned professional consent, and stops as soon as either of you withdraws.'
        : 'Live location sharing is only available while a booking is confirmed or in progress and a professional is assigned.',
    });
  }));

  app.post('/api/bookings/:bookingId/location-sharing/consent', sharingUpdateLimit, asyncRoute(async (req, res) => {
    const actor = await resolveSharingActor(req);
    if (!actor) return apiError(res, 401, 'Sign in to manage live location consent.');
    const decision = req.body?.decision;
    if (decision !== 'grant' && decision !== 'withdraw') return apiError(res, 400, 'Send decision as grant or withdraw.');

    const parties = await loadBookingParties(req.params.bookingId, actor);
    if (parties.error) return apiError(res, parties.error[0], parties.error[1]);

    const workerId = targetWorkerId(actor, req.body?.workerId, parties.assignedWorkerIds);
    if (!workerId) return apiError(res, 400, 'Choose which assigned professional this consent applies to.');

    const { rows: openRows } = await pool.query(
      `SELECT ${SESSION_COLUMNS} FROM booking_location_sharing
        WHERE booking_id = $1 AND worker_id = $2
          AND status IN ('pending_customer_consent','pending_professional_consent','active')
        LIMIT 1`,
      [parties.booking.id, workerId],
    );
    const open = openRows[0] ? await enforceSessionLifecycle(openRows[0], parties.booking, parties.assignedWorkerIds) : null;

    if (decision === 'withdraw') {
      if (!open || !['pending_customer_consent', 'pending_professional_consent', 'active'].includes(open.status)) {
        return apiError(res, 409, 'There is no active live location sharing to stop.');
      }
      const stopped = await markSessionStopped(open.id, actor.isProfessional ? 'professional_withdrew_consent' : 'customer_withdrew_consent');
      return res.json({ session: sessionView(stopped, actor, parties.assigned.find(row => row.workerId === workerId)?.workerName), stopped: true });
    }

    if (!TRACKABLE_BOOKING_STATUSES.includes(parties.booking.status)) {
      return apiError(res, 409, 'Live location sharing needs a confirmed or in-progress booking.');
    }
    if (!parties.assignedWorkerIds.includes(workerId)) {
      return apiError(res, 409, 'That professional is not currently assigned to this booking.');
    }

    const consentColumn = actor.isProfessional ? 'professional_consent_at' : 'customer_consent_at';
    const consentParty = actor.isProfessional ? 'professional' : 'customer';

    if (!open) {
      const createdAt = new Date();
      const { rows } = await pool.query(
        `INSERT INTO booking_location_sharing(booking_id, worker_id, status, ${consentColumn}, expires_at)
         VALUES($1, $2, $3, now(), $4)
         RETURNING ${SESSION_COLUMNS}`,
        [
          parties.booking.id,
          workerId,
          actor.isProfessional ? 'pending_customer_consent' : 'pending_professional_consent',
          new Date(createdAt.getTime() + CONSENT_TTL_MS).toISOString(),
        ],
      );
      return res.json({
        session: sessionView(rows[0], actor, parties.assigned.find(row => row.workerId === workerId)?.workerName),
        awaitingOtherParty: true,
      });
    }

    if (open.status === 'active') {
      return res.json({ session: sessionView(open, actor, parties.assigned.find(row => row.workerId === workerId)?.workerName), alreadyActive: true });
    }

    // A single conditional UPDATE makes concurrent customer/professional consent
    // safe: PostgreSQL rechecks the other party's consent after acquiring the row lock.
    const { rows } = await pool.query(
      `UPDATE booking_location_sharing
          SET customer_consent_at = CASE WHEN $2 = 'customer' THEN COALESCE(customer_consent_at, now()) ELSE customer_consent_at END,
              professional_consent_at = CASE WHEN $2 = 'professional' THEN COALESCE(professional_consent_at, now()) ELSE professional_consent_at END,
              status = CASE WHEN (customer_consent_at IS NOT NULL OR $2 = 'customer')
                                  AND (professional_consent_at IS NOT NULL OR $2 = 'professional') THEN 'active' ELSE status END,
              started_at = CASE WHEN (customer_consent_at IS NOT NULL OR $2 = 'customer')
                                      AND (professional_consent_at IS NOT NULL OR $2 = 'professional') THEN COALESCE(started_at, now()) ELSE started_at END,
              expires_at = CASE WHEN (customer_consent_at IS NOT NULL OR $2 = 'customer')
                                      AND (professional_consent_at IS NOT NULL OR $2 = 'professional') THEN $3 ELSE expires_at END,
              updated_at = now()
        WHERE id = $1 AND status IN ('pending_customer_consent','pending_professional_consent')
        RETURNING ${SESSION_COLUMNS}`,
      [open.id, consentParty, new Date(Date.now() + SHARING_DEFAULT_TTL_MS).toISOString()],
    );
    const updated = rows[0] ?? (await pool.query(`SELECT ${SESSION_COLUMNS} FROM booking_location_sharing WHERE id = $1`, [open.id])).rows[0] ?? open;
    const active = updated.status === 'active';
    res.json({
      session: sessionView(updated, actor, parties.assigned.find(row => row.workerId === workerId)?.workerName),
      ...(active ? { active: true } : { awaitingOtherParty: true }),
    });
  }));

  app.post('/api/bookings/:bookingId/location-sharing/stop', sharingUpdateLimit, asyncRoute(async (req, res) => {
    const actor = await resolveSharingActor(req);
    if (!actor) return apiError(res, 401, 'Sign in to stop live location sharing.');
    const parties = await loadBookingParties(req.params.bookingId, actor);
    if (parties.error) return apiError(res, parties.error[0], parties.error[1]);

    const workerId = targetWorkerId(actor, req.body?.workerId, parties.assignedWorkerIds);
    if (!workerId) return apiError(res, 404, 'No live location sharing found for this booking.');

    const { rows: openRows } = await pool.query(
      `SELECT ${SESSION_COLUMNS} FROM booking_location_sharing
        WHERE booking_id = $1 AND worker_id = $2
          AND status IN ('pending_customer_consent','pending_professional_consent','active')
        LIMIT 1`,
      [parties.booking.id, workerId],
    );
    if (!openRows[0]) return apiError(res, 404, 'No live location sharing found for this booking.');

    const requestedReason = typeof req.body?.reason === 'string' ? req.body.reason.slice(0, 120) : '';
    const reason = requestedReason || (actor.isProfessional ? 'professional_stopped' : 'customer_stopped');
    const stopped = await markSessionStopped(openRows[0].id, reason);
    res.json({ session: sessionView(stopped, actor, parties.assigned.find(row => row.workerId === workerId)?.workerName), stopped: true });
  }));

  app.post('/api/bookings/:bookingId/location-sharing/update', sharingUpdateLimit, asyncRoute(async (req, res) => {
    const actor = await resolveSharingActor(req);
    if (!actor) return apiError(res, 401, 'Sign in to update your shared location.');

    const coordinateProblem = coordinateError(req.body?.latitude, req.body?.longitude, { required: true });
    if (coordinateProblem) return apiError(res, 400, coordinateProblem);
    const accuracyProblem = accuracyError(req.body?.accuracyMeters ?? null);
    if (accuracyProblem) return apiError(res, 400, accuracyProblem);

    const parties = await loadBookingParties(req.params.bookingId, actor);
    if (parties.error) return apiError(res, parties.error[0], parties.error[1]);

    const workerId = targetWorkerId(actor, req.body?.workerId, parties.assignedWorkerIds);
    if (!workerId) return apiError(res, 404, 'No live location sharing found for this booking.');

    const { rows: openRows } = await pool.query(
      `SELECT ${SESSION_COLUMNS} FROM booking_location_sharing
        WHERE booking_id = $1 AND worker_id = $2
          AND status IN ('pending_customer_consent','pending_professional_consent','active')
        LIMIT 1`,
      [parties.booking.id, workerId],
    );
    if (!openRows[0]) return apiError(res, 403, 'Start live location sharing before sending a position.');

    const session = await enforceSessionLifecycle(openRows[0], parties.booking, parties.assignedWorkerIds);
    if (session.status !== 'active') {
      return apiError(res, 403, session.stopReason === 'expired'
        ? 'This live location session expired. Both parties must consent again.'
        : 'Live location sharing is not active for this booking.');
    }

    const latitude = Number(req.body.latitude);
    const longitude = Number(req.body.longitude);
    const accuracyMeters = req.body?.accuracyMeters === null || req.body?.accuracyMeters === undefined ? null : Number(req.body.accuracyMeters);

    // Each party may only ever write its own coordinates.
    const { rows } = await pool.query(
      actor.isProfessional
        ? `UPDATE booking_location_sharing
              SET worker_latitude = $2, worker_longitude = $3, worker_accuracy_meters = $4,
                  worker_location_updated_at = now(), updated_at = now()
            WHERE id = $1 AND status = 'active'
            RETURNING ${SESSION_COLUMNS}`
        : `UPDATE booking_location_sharing
              SET customer_latitude = $2, customer_longitude = $3, customer_accuracy_meters = $4,
                  customer_location_updated_at = now(), updated_at = now()
            WHERE id = $1 AND status = 'active'
            RETURNING ${SESSION_COLUMNS}`,
      [session.id, latitude, longitude, accuracyMeters],
    );
    if (!rows.length) return apiError(res, 403, 'Live location sharing is no longer active.');

    res.json({
      session: sessionView(rows[0], actor, parties.assigned.find(row => row.workerId === workerId)?.workerName),
      accepted: true,
    });
  }));
}

/**
 * Stops any live tracking attached to a booking. Used by booking status changes so
 * cancellation and completion take effect immediately rather than on the next read.
 */
export async function stopSharingForBooking(pool, bookingId, reason) {
  await pool.query(
    `UPDATE booking_location_sharing
        SET status = 'stopped', stopped_at = now(), stop_reason = $2,
            worker_latitude = NULL, worker_longitude = NULL, worker_accuracy_meters = NULL, worker_location_updated_at = NULL,
            customer_latitude = NULL, customer_longitude = NULL, customer_accuracy_meters = NULL, customer_location_updated_at = NULL,
            updated_at = now()
      WHERE booking_id = $1 AND status IN ('pending_customer_consent','pending_professional_consent','active')`,
    [bookingId, reason],
  );
}
