ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check CHECK(status IN ('pending','pending_location_review','pending_worker_assignment','pending_confirmation','confirmed','in_progress','completed','rescheduling_requested','cancelled','rejected'));
CREATE UNIQUE INDEX IF NOT EXISTS idx_booking_one_active_assignment ON booking_assignments(booking_id) WHERE assignment_status IN ('assigned','confirmed','in_progress');
ALTER TABLE contact_submissions DROP CONSTRAINT IF EXISTS contact_submissions_status_check;
ALTER TABLE contact_submissions ADD CONSTRAINT contact_submissions_status_check CHECK(status IN ('new','in_progress','responded','closed'));
