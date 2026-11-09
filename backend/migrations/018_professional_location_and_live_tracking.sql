-- Professional device location and booking-scoped live location sharing.
--
-- Discovery location: workers.latitude/longitude (migration 007) already hold the
-- last known professional position. This migration adds the metadata needed to
-- judge whether that position may be shown to customers, plus the tables that back
-- authenticated professional accounts and consented, booking-specific tracking.

ALTER TABLE workers ADD COLUMN IF NOT EXISTS location_accuracy_meters DOUBLE PRECISION;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMPTZ;
-- Customers only ever see precise coordinates for professionals who opted in to
-- sharing their approximate working position. Default deny.
ALTER TABLE workers ADD COLUMN IF NOT EXISTS location_sharing_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS location_source TEXT;

ALTER TABLE workers ADD CONSTRAINT workers_latitude_range_check
  CHECK (latitude IS NULL OR (latitude BETWEEN -90 AND 90));
ALTER TABLE workers ADD CONSTRAINT workers_longitude_range_check
  CHECK (longitude IS NULL OR (longitude BETWEEN -180 AND 180));
ALTER TABLE workers ADD CONSTRAINT workers_coordinate_pair_check
  CHECK ((latitude IS NULL) = (longitude IS NULL));
ALTER TABLE workers ADD CONSTRAINT workers_location_accuracy_check
  CHECK (location_accuracy_meters IS NULL OR (location_accuracy_meters >= 0 AND location_accuracy_meters <= 100000));
ALTER TABLE workers ADD CONSTRAINT workers_location_source_check
  CHECK (location_source IS NULL OR location_source IN ('device','seed','operations'));

-- Demo workers exist to exercise the customer-facing flow, so they opt in to
-- approximate exposure. Real professional records stay opted out until the
-- professional turns sharing on from their own authenticated device.
UPDATE workers SET location_sharing_enabled = TRUE, location_source = COALESCE(location_source, 'seed'),
  location_updated_at = COALESCE(location_updated_at, now())
  WHERE is_demo = TRUE AND latitude IS NOT NULL AND longitude IS NOT NULL;

-- Professional sign-in. Mirrors customer_auth: one credential row per professional
-- account, phone identifies the professional, password_hash follows the same
-- scrypt format used by passwordHash()/passwordMatches() in backend/index.mjs.
CREATE TABLE worker_auth (
  worker_id     UUID PRIMARY KEY REFERENCES workers(id) ON DELETE RESTRICT,
  phone         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One row per live-sharing session. Both parties must consent before status
-- becomes 'active'; the row also stores the latest position of each party so no
-- historical trail is retained.
CREATE TABLE booking_location_sharing (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id            UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  worker_id             UUID NOT NULL REFERENCES workers(id) ON DELETE RESTRICT,
  status                TEXT NOT NULL DEFAULT 'pending_customer_consent'
    CHECK (status IN ('pending_customer_consent','pending_professional_consent','active','stopped','expired')),
  customer_consent_at   TIMESTAMPTZ,
  professional_consent_at TIMESTAMPTZ,
  started_at            TIMESTAMPTZ,
  stopped_at            TIMESTAMPTZ,
  stop_reason           TEXT,
  expires_at            TIMESTAMPTZ NOT NULL,
  worker_latitude       DOUBLE PRECISION,
  worker_longitude      DOUBLE PRECISION,
  worker_accuracy_meters DOUBLE PRECISION,
  worker_location_updated_at TIMESTAMPTZ,
  customer_latitude     DOUBLE PRECISION,
  customer_longitude    DOUBLE PRECISION,
  customer_accuracy_meters DOUBLE PRECISION,
  customer_location_updated_at TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_booking_location_sharing_open
  ON booking_location_sharing(booking_id)
  WHERE status IN ('pending_customer_consent','pending_professional_consent','active');
CREATE INDEX idx_booking_location_sharing_worker ON booking_location_sharing(worker_id, status);

ALTER TABLE booking_location_sharing ADD CONSTRAINT booking_location_sharing_worker_coordinate_pair_check
  CHECK ((worker_latitude IS NULL) = (worker_longitude IS NULL));
ALTER TABLE booking_location_sharing ADD CONSTRAINT booking_location_sharing_customer_coordinate_pair_check
  CHECK ((customer_latitude IS NULL) = (customer_longitude IS NULL));
ALTER TABLE booking_location_sharing ADD CONSTRAINT booking_location_sharing_window_check
  CHECK (expires_at > created_at);
