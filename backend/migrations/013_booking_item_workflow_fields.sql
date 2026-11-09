ALTER TABLE booking_items ADD COLUMN IF NOT EXISTS scope_notes TEXT NOT NULL DEFAULT '';
ALTER TABLE booking_items ADD COLUMN IF NOT EXISTS answers_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE booking_items ADD COLUMN IF NOT EXISTS worker_selection_mode TEXT NOT NULL DEFAULT 'meraki_matched';
ALTER TABLE booking_items ADD COLUMN IF NOT EXISTS worker_preference TEXT;
ALTER TABLE booking_items ADD COLUMN IF NOT EXISTS preferred_worker_id UUID REFERENCES workers(id) ON DELETE RESTRICT;
ALTER TABLE booking_items ADD COLUMN IF NOT EXISTS suggested_worker_id UUID REFERENCES workers(id) ON DELETE RESTRICT;
ALTER TABLE booking_items ADD CONSTRAINT booking_items_worker_selection_mode_check
  CHECK(worker_selection_mode IN ('customer_selected','meraki_matched','operations_review'));
ALTER TABLE booking_items ADD CONSTRAINT booking_items_answers_snapshot_object_check
  CHECK(jsonb_typeof(answers_snapshot)='object');
CREATE INDEX IF NOT EXISTS idx_booking_items_preferred_worker ON booking_items(preferred_worker_id) WHERE preferred_worker_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_booking_items_suggested_worker ON booking_items(suggested_worker_id) WHERE suggested_worker_id IS NOT NULL;

ALTER TABLE worker_reservations ADD CONSTRAINT worker_reservations_expiry_window_check
  CHECK(expires_at IS NULL OR (expires_at>=created_at AND
    ((extension_count=0 AND expires_at<=created_at+INTERVAL '30 minutes') OR
     (extension_count=1 AND expires_at<=created_at+INTERVAL '60 minutes'))));
ALTER TABLE reservation_extension_history ADD CONSTRAINT reservation_extension_once_key UNIQUE(reservation_id);

CREATE INDEX IF NOT EXISTS idx_booking_change_proposals_item_status ON booking_change_proposals(booking_item_id,proposal_status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_price_proposals_status ON booking_price_proposals(booking_item_id,proposal_status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_worker_documents_reviewed_by ON worker_documents(reviewed_by) WHERE reviewed_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_worker_document_history_document ON worker_document_history(document_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_worker_document_history_actor ON worker_document_history(changed_by) WHERE changed_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_worker_onboarding_actor ON worker_onboarding_history(changed_by) WHERE changed_by IS NOT NULL;
