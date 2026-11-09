-- Re-scope worker assignments to service items and align related rows to the
-- same parent booking. This migration is additive except for replacing the
-- erroneous parent-booking-wide active-assignment uniqueness rule.
DROP INDEX IF EXISTS idx_booking_one_active_assignment;

ALTER TABLE booking_items ADD CONSTRAINT booking_items_booking_id_id_key UNIQUE(booking_id,id);
ALTER TABLE service_questionnaire_versions ADD CONSTRAINT service_questionnaire_versions_service_id_id_key UNIQUE(service_id,id);
ALTER TABLE booking_items ADD CONSTRAINT booking_items_service_questionnaire_service_fk
  FOREIGN KEY(service_id,questionnaire_version_id)
  REFERENCES service_questionnaire_versions(service_id,id);
-- A null questionnaire is valid; when present it must belong to the item service.

ALTER TABLE booking_assignments ALTER COLUMN booking_item_id SET NOT NULL;
ALTER TABLE booking_assignments ADD CONSTRAINT booking_assignments_booking_item_parent_fk
  FOREIGN KEY(booking_id,booking_item_id) REFERENCES booking_items(booking_id,id) ON DELETE RESTRICT;
ALTER TABLE booking_assignments ADD CONSTRAINT booking_assignments_item_worker_id_key UNIQUE(booking_item_id,worker_id,id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_booking_assignments_active_item_worker
  ON booking_assignments(booking_item_id,worker_id)
  WHERE assignment_status IN ('assigned','confirmed','in_progress');
CREATE INDEX IF NOT EXISTS idx_booking_assignments_booking_status ON booking_assignments(booking_id,assignment_status);
ALTER TABLE worker_reservations ADD CONSTRAINT worker_reservations_assignment_consistency_fk
  FOREIGN KEY(booking_item_id,worker_id,assignment_id)
  REFERENCES booking_assignments(booking_item_id,worker_id,id) ON DELETE RESTRICT;

ALTER TABLE payment_allocations ADD COLUMN IF NOT EXISTS booking_id UUID;
UPDATE payment_allocations a SET booking_id=p.booking_id FROM payments p WHERE a.payment_id=p.id AND a.booking_id IS NULL;
ALTER TABLE payments ADD CONSTRAINT payments_booking_id_id_key UNIQUE(booking_id,id);
ALTER TABLE payment_allocations ALTER COLUMN booking_id SET NOT NULL;
ALTER TABLE payment_allocations ADD CONSTRAINT payment_allocations_payment_booking_fk
  FOREIGN KEY(booking_id,payment_id) REFERENCES payments(booking_id,id) ON DELETE RESTRICT;
ALTER TABLE payment_allocations ADD CONSTRAINT payment_allocations_item_booking_fk
  FOREIGN KEY(booking_id,booking_item_id) REFERENCES booking_items(booking_id,id) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS idx_payment_allocations_booking ON payment_allocations(booking_id);

UPDATE refunds r SET booking_id=p.booking_id FROM payments p WHERE r.payment_id=p.id AND r.booking_id IS NULL;
ALTER TABLE refunds ALTER COLUMN booking_id SET NOT NULL;
ALTER TABLE refunds ADD CONSTRAINT refunds_payment_booking_fk
  FOREIGN KEY(booking_id,payment_id) REFERENCES payments(booking_id,id) ON DELETE RESTRICT;
ALTER TABLE refunds ADD CONSTRAINT refunds_item_booking_fk
  FOREIGN KEY(booking_id,booking_item_id) REFERENCES booking_items(booking_id,id) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS idx_refunds_payment_status ON refunds(payment_id,status);

ALTER TABLE payments ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES payment_providers(id) ON DELETE RESTRICT;
ALTER TABLE service_packages ADD COLUMN IF NOT EXISTS effective_from TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE service_packages ADD COLUMN IF NOT EXISTS effective_to TIMESTAMPTZ;
ALTER TABLE service_packages ADD CONSTRAINT service_packages_effective_range_check
  CHECK(effective_to IS NULL OR effective_to>effective_from);
ALTER TABLE customer_addresses ADD CONSTRAINT customer_addresses_coordinate_pair_check
  CHECK((latitude IS NULL)=(longitude IS NULL));
ALTER TABLE file_attachments DROP CONSTRAINT file_attachments_check;
ALTER TABLE file_attachments ADD CONSTRAINT file_attachments_one_uploader_check
  CHECK(num_nonnulls(uploaded_by_customer,uploaded_by_worker,uploaded_by_staff)=1);
ALTER TABLE workers ADD CONSTRAINT workers_rating_range_check CHECK(rating IS NULL OR rating BETWEEN 0 AND 5);

-- Index foreign keys used for lookup/deletion checks and management joins.
CREATE INDEX IF NOT EXISTS idx_customer_contacts_customer ON customer_contacts(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_packages_service ON service_packages(service_id);
CREATE INDEX IF NOT EXISTS idx_worker_services_service ON worker_services(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation ON quotation_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_refunds_booking ON refunds(booking_id);
CREATE INDEX IF NOT EXISTS idx_refunds_item ON refunds(booking_item_id) WHERE booking_item_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_price_change_requests_booking ON price_change_requests(booking_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_booking ON complaints(booking_id,created_at DESC) WHERE booking_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_complaint_actions_complaint ON complaint_actions(complaint_id,created_at);
CREATE INDEX IF NOT EXISTS idx_worker_restrictions_worker_status ON worker_restrictions(worker_id,status,starts_at);
CREATE INDEX IF NOT EXISTS idx_worker_skills_skill_status ON worker_skills(skill_id,verification_status,valid_until);
CREATE INDEX IF NOT EXISTS idx_worker_documents_file ON worker_documents(file_id);
CREATE INDEX IF NOT EXISTS idx_worker_service_areas_area ON worker_service_areas(service_area_id,worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_availability_exceptions_staff ON worker_availability_exceptions(created_by) WHERE created_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_worker_onboarding_history_worker ON worker_onboarding_history(worker_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_pricing_rules_created_by ON service_pricing_rules(created_by) WHERE created_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_service_pricing_rules_updated_by ON service_pricing_rules(updated_by) WHERE updated_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_questionnaire_versions_created_by ON service_questionnaire_versions(created_by) WHERE created_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_service_coverage_areas_area ON service_coverage_areas(service_area_id,service_id);
CREATE INDEX IF NOT EXISTS idx_service_skill_requirements_skill ON service_skill_requirements(skill_id,service_id);
CREATE INDEX IF NOT EXISTS idx_booking_items_service ON booking_items(service_id,booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_items_package ON booking_items(package_id) WHERE package_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_booking_items_questionnaire ON booking_items(questionnaire_version_id) WHERE questionnaire_version_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_booking_answers_question ON booking_item_answers(question_id,booking_item_id);
CREATE INDEX IF NOT EXISTS idx_booking_answers_file ON booking_item_answers(file_id) WHERE file_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reservation_assignment ON worker_reservations(assignment_id) WHERE assignment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reservation_extension_history ON reservation_extension_history(reservation_id,created_at);
CREATE INDEX IF NOT EXISTS idx_rescheduling_decided_by ON rescheduling_requests(decided_by) WHERE decided_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rescheduling_customer ON rescheduling_requests(requested_by_customer,created_at DESC) WHERE requested_by_customer IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_communication_actor ON booking_communication_logs(actor_staff_id,created_at DESC) WHERE actor_staff_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payment_transactions_attempt ON payment_transactions(payment_attempt_id,received_at DESC);
CREATE INDEX IF NOT EXISTS idx_refund_transactions_refund ON refund_transactions(refund_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON booking_item_reviews(customer_id,submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_worker ON booking_item_reviews(worker_id,submitted_at DESC) WHERE worker_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_moderator ON booking_item_reviews(moderated_by,publication_status) WHERE moderated_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_notification ON notification_deliveries(notification_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_staff_users_role ON staff_users(role_id,is_active);
CREATE INDEX IF NOT EXISTS idx_staff_role_permissions_permission ON staff_role_permissions(permission_id,role_id);
CREATE INDEX IF NOT EXISTS idx_file_attachments_customer ON file_attachments(uploaded_by_customer) WHERE uploaded_by_customer IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_file_attachments_worker ON file_attachments(uploaded_by_worker) WHERE uploaded_by_worker IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_file_attachments_staff ON file_attachments(uploaded_by_staff) WHERE uploaded_by_staff IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_booking_reschedule_proposals_booking ON booking_reschedule_proposals(booking_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_change_proposals_created_by ON booking_change_proposals(created_by) WHERE created_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_booking_price_proposals_created_by ON booking_price_proposals(created_by) WHERE created_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contact_submissions_handled_by ON contact_submissions(handled_by) WHERE handled_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_booking_communication_booking ON booking_communication_logs(booking_id,created_at DESC);
