ALTER TABLE service_packages ADD COLUMN IF NOT EXISTS demo_seed_key TEXT UNIQUE;

ALTER TABLE workers ADD COLUMN IF NOT EXISTS worker_code TEXT UNIQUE;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS photo_url TEXT NOT NULL DEFAULT '';
ALTER TABLE workers ADD COLUMN IF NOT EXISTS service_area TEXT NOT NULL DEFAULT '';
ALTER TABLE workers ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS base_rate NUMERIC(12,2);
ALTER TABLE workers ADD COLUMN IF NOT EXISTS rate_currency CHAR(3) NOT NULL DEFAULT 'ETB';
ALTER TABLE workers ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1);
ALTER TABLE workers ADD COLUMN IF NOT EXISTS review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0);
ALTER TABLE workers ADD CONSTRAINT workers_coordinates_pair CHECK ((latitude IS NULL) = (longitude IS NULL));
ALTER TABLE workers ADD CONSTRAINT workers_latitude_range CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90);
ALTER TABLE workers ADD CONSTRAINT workers_longitude_range CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180);

ALTER TABLE worker_services ADD COLUMN IF NOT EXISTS qualification_name TEXT NOT NULL DEFAULT '';
ALTER TABLE worker_services ADD COLUMN IF NOT EXISTS demo_qualification BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS worker_selection_mode TEXT NOT NULL DEFAULT 'meraki_matched';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS preferred_worker_id UUID REFERENCES workers(id) ON DELETE RESTRICT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS suggested_worker_id UUID REFERENCES workers(id) ON DELETE RESTRICT;
ALTER TABLE bookings ADD CONSTRAINT bookings_worker_selection_mode_check CHECK (worker_selection_mode IN ('customer_selected','meraki_matched','operations_review'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_total NUMERIC(12,2);

ALTER TABLE booking_assignments ADD COLUMN IF NOT EXISTS assigned_by TEXT NOT NULL DEFAULT 'system';
ALTER TABLE booking_assignments ADD COLUMN IF NOT EXISTS assignment_start TIMESTAMPTZ;
ALTER TABLE booking_assignments ADD COLUMN IF NOT EXISTS assignment_end TIMESTAMPTZ;
ALTER TABLE booking_assignments ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_booking_assignments_worker_time ON booking_assignments(worker_id,assignment_start,assignment_end);

CREATE TABLE IF NOT EXISTS worker_unavailability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE RESTRICT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  CHECK (starts_at < ends_at)
);
CREATE INDEX IF NOT EXISTS idx_worker_unavailability_time ON worker_unavailability(worker_id,starts_at,ends_at);
ALTER TABLE worker_unavailability ADD COLUMN IF NOT EXISTS demo_seed_key TEXT UNIQUE;
CREATE UNIQUE INDEX IF NOT EXISTS idx_worker_availability_weekly_unique ON worker_availability(worker_id,weekday,start_time,end_time) WHERE specific_date IS NULL;

ALTER TABLE payments ADD COLUMN IF NOT EXISTS is_simulated BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS transaction_reference TEXT UNIQUE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS total_paid_after NUMERIC(12,2);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS remaining_balance NUMERIC(12,2);
CREATE INDEX IF NOT EXISTS idx_payments_booking_created ON payments(booking_id,created_at DESC);

ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS handled_by UUID REFERENCES staff_users(id) ON DELETE RESTRICT;
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS internal_notes TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status_created ON contact_submissions(status,created_at DESC);

INSERT INTO permissions(id,description) VALUES
  ('workers.read','View worker profiles and qualifications'),
  ('workers.manage','Manage worker qualifications and assignments'),
  ('assignments.manage','Assign eligible workers to booking requests'),
  ('contacts.manage','Update contact handling status and notes'),
  ('audit.read','View append-only audit history'),
  ('payments.read','View payment simulation records')
ON CONFLICT DO NOTHING;
INSERT INTO staff_role_permissions(role_id,permission_id) VALUES
  ('admin','workers.read'),('admin','workers.manage'),('admin','assignments.manage'),('admin','contacts.manage'),('admin','audit.read'),('admin','payments.read'),
  ('operations','workers.read'),('operations','workers.manage'),('operations','assignments.manage'),('operations','contacts.manage'),('operations','payments.read')
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_action ON audit_logs(created_at DESC,action);
