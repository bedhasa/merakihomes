CREATE TABLE IF NOT EXISTS worker_performance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_item_id UUID NOT NULL,
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE RESTRICT,
  booking_assignment_id UUID NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('quality','timeliness','customer_service','safety','overall')),
  score SMALLINT NOT NULL CHECK(score BETWEEN 1 AND 5),
  notes TEXT NOT NULL DEFAULT '' CHECK(length(notes)<=1000),
  recorded_by UUID NOT NULL REFERENCES staff_users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY(booking_item_id,worker_id,booking_assignment_id)
    REFERENCES booking_assignments(booking_item_id,worker_id,id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_worker_performance_worker_created ON worker_performance_records(worker_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_worker_performance_item ON worker_performance_records(booking_item_id,created_at DESC);

INSERT INTO permissions(id,description) VALUES ('reviews.manage','Moderate customer service reviews') ON CONFLICT(id) DO NOTHING;
INSERT INTO staff_role_permissions(role_id,permission_id) VALUES ('admin','reviews.manage'),('operations','reviews.manage') ON CONFLICT DO NOTHING;
