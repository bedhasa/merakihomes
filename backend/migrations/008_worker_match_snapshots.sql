ALTER TABLE bookings ADD COLUMN IF NOT EXISTS suggested_worker_id UUID REFERENCES workers(id) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS idx_bookings_preferred_worker ON bookings(preferred_worker_id) WHERE preferred_worker_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_suggested_worker ON bookings(suggested_worker_id) WHERE suggested_worker_id IS NOT NULL;
