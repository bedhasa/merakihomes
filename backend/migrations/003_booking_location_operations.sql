ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_answers JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS nearby_landmark TEXT NOT NULL DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS location_method TEXT NOT NULL DEFAULT 'manual';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS location_confirmed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS location_review_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS location_review_note TEXT NOT NULL DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS internal_notes TEXT NOT NULL DEFAULT '';
ALTER TABLE bookings ADD CONSTRAINT bookings_location_method_check CHECK (location_method IN ('manual','search','map'));
ALTER TABLE bookings ADD CONSTRAINT bookings_location_review_check CHECK (location_review_status IN ('pending','resolved','not_required'));
ALTER TABLE bookings ADD CONSTRAINT bookings_latitude_check CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90);
ALTER TABLE bookings ADD CONSTRAINT bookings_longitude_check CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180);
CREATE INDEX IF NOT EXISTS idx_bookings_location_review ON bookings(location_review_status,created_at DESC);
CREATE TABLE IF NOT EXISTS booking_reschedule_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  previous_start TIMESTAMPTZ NOT NULL,
  proposed_start TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_customer_approval' CHECK (status IN ('pending_customer_approval','accepted','rejected','withdrawn')),
  proposed_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reschedule_proposals_booking ON booking_reschedule_proposals(booking_id,created_at DESC);
INSERT INTO permissions(id,description) VALUES ('bookings.manage','Review and manage booking requests') ON CONFLICT DO NOTHING;
INSERT INTO staff_role_permissions(role_id,permission_id) VALUES ('admin','bookings.manage'),('operations','bookings.manage') ON CONFLICT DO NOTHING;
