-- TD-006: allow one open location-sharing session per (booking, worker) instead of per booking.
--
-- The API already models sessions per booking and worker (professionals.mjs looks up and inserts
-- by booking_id + worker_id), but migration 018 made open sessions unique per booking only.
-- On a multi-item booking with two assigned workers, the second worker's consent therefore failed
-- with a unique violation.
--
-- Safe on existing data: the old index was strictly narrower, so no existing rows can violate the
-- new one. The table is small, so a plain (non-concurrent) index build inside the migration
-- transaction is acceptable.

DROP INDEX IF EXISTS idx_booking_location_sharing_open;

CREATE UNIQUE INDEX IF NOT EXISTS idx_booking_location_sharing_open_worker
  ON booking_location_sharing(booking_id, worker_id)
  WHERE status IN ('pending_customer_consent', 'pending_professional_consent', 'active');
