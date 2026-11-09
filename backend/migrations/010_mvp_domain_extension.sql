-- Additive MVP domain expansion. Existing customer, worker, booking, payment,
-- quotation, audit, and catalogue rows remain in place.

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Extend saved addresses without replacing the existing table or its records.
ALTER TABLE customer_addresses ADD COLUMN IF NOT EXISTS city TEXT NOT NULL DEFAULT '';
ALTER TABLE customer_addresses ADD COLUMN IF NOT EXISTS sub_city TEXT NOT NULL DEFAULT '';
ALTER TABLE customer_addresses ADD COLUMN IF NOT EXISTS area TEXT NOT NULL DEFAULT '';
ALTER TABLE customer_addresses ADD COLUMN IF NOT EXISTS street_building TEXT NOT NULL DEFAULT '';
ALTER TABLE customer_addresses ADD COLUMN IF NOT EXISTS landmark TEXT NOT NULL DEFAULT '';
ALTER TABLE customer_addresses ADD COLUMN IF NOT EXISTS directions TEXT NOT NULL DEFAULT '';
ALTER TABLE customer_addresses ADD COLUMN IF NOT EXISTS latitude NUMERIC(9,6);
ALTER TABLE customer_addresses ADD COLUMN IF NOT EXISTS longitude NUMERIC(9,6);
ALTER TABLE customer_addresses ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE customer_addresses ADD CONSTRAINT customer_addresses_latitude_check CHECK(latitude IS NULL OR latitude BETWEEN -90 AND 90);
ALTER TABLE customer_addresses ADD CONSTRAINT customer_addresses_longitude_check CHECK(longitude IS NULL OR longitude BETWEEN -180 AND 180);
CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_addresses_one_default ON customer_addresses(customer_id) WHERE is_default;

CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS worker_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE RESTRICT,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK(verification_status IN ('pending','verified','rejected','expired')),
  verified_by UUID REFERENCES staff_users(id) ON DELETE RESTRICT, verified_at TIMESTAMPTZ,
  valid_until DATE, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(worker_id,skill_id),
  CHECK((verification_status <> 'verified') OR verified_at IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_worker_skills_eligibility ON worker_skills(worker_id,verification_status,valid_until);
CREATE TABLE IF NOT EXISTS file_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), storage_key TEXT NOT NULL UNIQUE,
  original_filename TEXT NOT NULL, mime_type TEXT NOT NULL, size_bytes BIGINT NOT NULL CHECK(size_bytes>0),
  uploaded_by_customer UUID REFERENCES customers(id) ON DELETE RESTRICT,
  uploaded_by_worker UUID REFERENCES workers(id) ON DELETE RESTRICT,
  uploaded_by_staff UUID REFERENCES staff_users(id) ON DELETE RESTRICT,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK(visibility IN ('private','public')),
  checksum TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK(num_nonnulls(uploaded_by_customer,uploaded_by_worker,uploaded_by_staff)<=1)
);
CREATE TABLE IF NOT EXISTS worker_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE RESTRICT,
  file_id UUID NOT NULL REFERENCES file_attachments(id) ON DELETE RESTRICT,
  document_type TEXT NOT NULL, review_status TEXT NOT NULL DEFAULT 'pending' CHECK(review_status IN ('pending','approved','rejected','expired')),
  reviewed_by UUID REFERENCES staff_users(id) ON DELETE RESTRICT, reviewed_at TIMESTAMPTZ,
  expires_at DATE, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_worker_documents_review ON worker_documents(worker_id,review_status,expires_at);
CREATE TABLE IF NOT EXISTS worker_document_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), document_id UUID NOT NULL REFERENCES worker_documents(id) ON DELETE RESTRICT,
  from_status TEXT, to_status TEXT NOT NULL, reason TEXT NOT NULL DEFAULT '',
  changed_by UUID REFERENCES staff_users(id) ON DELETE RESTRICT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, city TEXT NOT NULL,
  sub_city TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '', is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_service_areas_name_city ON service_areas(lower(name),lower(city),lower(sub_city));
CREATE TABLE IF NOT EXISTS worker_service_areas (
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE RESTRICT,
  service_area_id UUID NOT NULL REFERENCES service_areas(id) ON DELETE RESTRICT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(worker_id,service_area_id)
);
CREATE TABLE IF NOT EXISTS worker_availability_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE RESTRICT,
  starts_at TIMESTAMPTZ NOT NULL, ends_at TIMESTAMPTZ NOT NULL,
  exception_type TEXT NOT NULL CHECK(exception_type IN ('unavailable','available_override')),
  reason TEXT NOT NULL DEFAULT '', created_by UUID REFERENCES staff_users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), CHECK(starts_at<ends_at)
);
CREATE INDEX IF NOT EXISTS idx_worker_availability_exceptions_time ON worker_availability_exceptions(worker_id,starts_at,ends_at);
CREATE TABLE IF NOT EXISTS worker_onboarding_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE RESTRICT,
  from_status TEXT, to_status TEXT NOT NULL, reason TEXT NOT NULL DEFAULT '',
  changed_by UUID REFERENCES staff_users(id) ON DELETE RESTRICT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE services DROP CONSTRAINT IF EXISTS services_pricing_type_check;
ALTER TABLE services ADD CONSTRAINT services_pricing_type_check CHECK(pricing_type IN ('fixed','quotation','calculated'));
CREATE TABLE IF NOT EXISTS service_pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), service_id TEXT NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  rule_name TEXT NOT NULL, rule_type TEXT NOT NULL CHECK(rule_type IN ('base','per_unit','add_on','condition','minimum')),
  configuration JSONB NOT NULL CHECK(jsonb_typeof(configuration)='object'), priority INTEGER NOT NULL DEFAULT 100,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(), effective_to TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE, created_by UUID REFERENCES staff_users(id) ON DELETE RESTRICT,
  updated_by UUID REFERENCES staff_users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK(effective_to IS NULL OR effective_to>effective_from)
);
CREATE INDEX IF NOT EXISTS idx_service_pricing_rules_live ON service_pricing_rules(service_id,is_active,effective_from,effective_to,priority);
CREATE TABLE IF NOT EXISTS service_questionnaire_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), service_id TEXT NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  version_number INTEGER NOT NULL CHECK(version_number>0), status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','retired')),
  effective_from TIMESTAMPTZ, created_by UUID REFERENCES staff_users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(service_id,version_number)
);
CREATE TABLE IF NOT EXISTS service_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), questionnaire_version_id UUID NOT NULL REFERENCES service_questionnaire_versions(id) ON DELETE RESTRICT,
  question_key TEXT NOT NULL, label TEXT NOT NULL,
  answer_type TEXT NOT NULL CHECK(answer_type IN ('short_text','number','select','yes_no','photo')),
  is_required BOOLEAN NOT NULL DEFAULT FALSE, display_order INTEGER NOT NULL DEFAULT 0,
  validation_rules JSONB NOT NULL DEFAULT '{}'::jsonb CHECK(jsonb_typeof(validation_rules)='object'),
  UNIQUE(questionnaire_version_id,question_key)
);
CREATE TABLE IF NOT EXISTS service_question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), question_id UUID NOT NULL REFERENCES service_questions(id) ON DELETE RESTRICT,
  option_value TEXT NOT NULL, option_label TEXT NOT NULL, display_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE(question_id,option_value), UNIQUE(question_id,display_order)
);
CREATE TABLE IF NOT EXISTS service_coverage_areas (
  service_id TEXT NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  service_area_id UUID NOT NULL REFERENCES service_areas(id) ON DELETE RESTRICT,
  coverage_status TEXT NOT NULL DEFAULT 'active' CHECK(coverage_status IN ('active','limited')),
  PRIMARY KEY(service_id,service_area_id)
);
CREATE TABLE IF NOT EXISTS service_skill_requirements (
  service_id TEXT NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
  is_mandatory BOOLEAN NOT NULL DEFAULT TRUE, PRIMARY KEY(service_id,skill_id)
);

-- Every existing one-service booking receives one service item. This is an
-- additive backfill; the legacy booking columns remain authoritative for the
-- current API until the later integration phase.
CREATE TABLE IF NOT EXISTS booking_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  item_number SMALLINT NOT NULL CHECK(item_number>0), service_id TEXT NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  package_id UUID REFERENCES service_packages(id) ON DELETE RESTRICT,
  questionnaire_version_id UUID REFERENCES service_questionnaire_versions(id) ON DELETE RESTRICT,
  item_status TEXT NOT NULL DEFAULT 'pending' CHECK(item_status IN ('pending','pending_location_review','pending_worker_assignment','pending_confirmation','confirmed','in_progress','completed','cancelled','rejected')),
  preferred_start_at TIMESTAMPTZ, preferred_end_at TIMESTAMPTZ,
  confirmed_start_at TIMESTAMPTZ, confirmed_end_at TIMESTAMPTZ,
  estimated_duration_minutes INTEGER NOT NULL CHECK(estimated_duration_minutes>0),
  actual_started_at TIMESTAMPTZ, actual_completed_at TIMESTAMPTZ,
  service_name_snapshot TEXT NOT NULL, package_name_snapshot TEXT,
  pricing_model_snapshot TEXT NOT NULL CHECK(pricing_model_snapshot IN ('fixed','quotation','calculated')),
  estimated_amount NUMERIC(12,2) CHECK(estimated_amount IS NULL OR estimated_amount>=0),
  approved_amount NUMERIC(12,2) CHECK(approved_amount IS NULL OR approved_amount>=0),
  currency CHAR(3) NOT NULL, pricing_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb CHECK(jsonb_typeof(pricing_snapshot)='object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(booking_id,item_number),
  CHECK(preferred_end_at IS NULL OR preferred_start_at IS NULL OR preferred_end_at>preferred_start_at),
  CHECK(confirmed_end_at IS NULL OR confirmed_start_at IS NULL OR confirmed_end_at>confirmed_start_at)
);
CREATE INDEX IF NOT EXISTS idx_booking_items_booking_status ON booking_items(booking_id,item_status);
CREATE TABLE IF NOT EXISTS booking_item_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), booking_item_id UUID NOT NULL REFERENCES booking_items(id) ON DELETE RESTRICT,
  question_id UUID NOT NULL REFERENCES service_questions(id) ON DELETE RESTRICT,
  answer_text TEXT, answer_number NUMERIC, answer_boolean BOOLEAN, answer_json JSONB,
  file_id UUID REFERENCES file_attachments(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(booking_item_id,question_id),
  CHECK(num_nonnulls(answer_text,answer_number,answer_boolean,answer_json,file_id)=1)
);
CREATE TABLE IF NOT EXISTS booking_item_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), booking_item_id UUID NOT NULL REFERENCES booking_items(id) ON DELETE RESTRICT,
  from_status TEXT, to_status TEXT NOT NULL, reason TEXT NOT NULL DEFAULT '', actor TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_booking_item_history ON booking_item_status_history(booking_item_id,created_at);

INSERT INTO booking_items(booking_id,item_number,service_id,package_id,service_name_snapshot,package_name_snapshot,
  item_status,preferred_start_at,estimated_duration_minutes,pricing_model_snapshot,estimated_amount,approved_amount,currency,pricing_snapshot,created_at,updated_at)
SELECT b.id,1,b.service_id,b.package_id,b.service_name_snapshot,b.package_name_snapshot,b.status,
  b.requested_start,b.estimated_duration_minutes,s.pricing_type,b.starting_estimate,b.agreed_amount,b.currency,
  jsonb_build_object('source','legacy_booking','bookingReference',b.reference),b.created_at,b.updated_at
FROM bookings b JOIN services s ON s.id=b.service_id
WHERE NOT EXISTS(SELECT 1 FROM booking_items i WHERE i.booking_id=b.id);

ALTER TABLE booking_assignments ADD COLUMN IF NOT EXISTS booking_item_id UUID REFERENCES booking_items(id) ON DELETE RESTRICT;
UPDATE booking_assignments a SET booking_item_id=i.id FROM booking_items i
WHERE a.booking_id=i.booking_id AND a.booking_item_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_booking_assignments_item ON booking_assignments(booking_item_id,assignment_status);

CREATE TABLE IF NOT EXISTS worker_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), booking_item_id UUID NOT NULL REFERENCES booking_items(id) ON DELETE RESTRICT,
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE RESTRICT,
  assignment_id UUID REFERENCES booking_assignments(id) ON DELETE RESTRICT,
  starts_at TIMESTAMPTZ NOT NULL, ends_at TIMESTAMPTZ NOT NULL,
  reservation_status TEXT NOT NULL DEFAULT 'active' CHECK(reservation_status IN ('active','confirmed','released','expired')),
  expires_at TIMESTAMPTZ, extension_count SMALLINT NOT NULL DEFAULT 0 CHECK(extension_count BETWEEN 0 AND 1),
  extended_at TIMESTAMPTZ, released_at TIMESTAMPTZ, release_reason TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), CHECK(starts_at<ends_at),
  CHECK(expires_at IS NULL OR expires_at<=created_at+INTERVAL '60 minutes')
);
ALTER TABLE worker_reservations ADD CONSTRAINT worker_reservations_no_overlap
  EXCLUDE USING gist(worker_id WITH =, tstzrange(starts_at,ends_at,'[)') WITH &&)
  WHERE(reservation_status IN ('active','confirmed'));
CREATE INDEX IF NOT EXISTS idx_worker_reservations_item ON worker_reservations(booking_item_id,reservation_status);
CREATE INDEX IF NOT EXISTS idx_worker_reservations_expiry ON worker_reservations(expires_at) WHERE reservation_status='active';
CREATE TABLE IF NOT EXISTS reservation_extension_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), reservation_id UUID NOT NULL REFERENCES worker_reservations(id) ON DELETE RESTRICT,
  previous_expiry TIMESTAMPTZ NOT NULL, new_expiry TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL, extended_by TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK(new_expiry>previous_expiry AND new_expiry<=previous_expiry+INTERVAL '30 minutes')
);
CREATE TABLE IF NOT EXISTS booking_change_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), booking_item_id UUID NOT NULL REFERENCES booking_items(id) ON DELETE RESTRICT,
  proposal_type TEXT NOT NULL CHECK(proposal_type IN ('schedule','worker','both')),
  old_values JSONB NOT NULL CHECK(jsonb_typeof(old_values)='object'),
  proposed_values JSONB NOT NULL CHECK(jsonb_typeof(proposed_values)='object'),
  proposal_status TEXT NOT NULL DEFAULT 'pending' CHECK(proposal_status IN ('pending','accepted','rejected','withdrawn','expired')),
  reason TEXT NOT NULL, created_by UUID REFERENCES staff_users(id) ON DELETE RESTRICT,
  customer_decided_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS booking_price_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), booking_item_id UUID NOT NULL REFERENCES booking_items(id) ON DELETE RESTRICT,
  proposal_number INTEGER NOT NULL CHECK(proposal_number>0), amount NUMERIC(12,2) NOT NULL CHECK(amount>=0),
  currency CHAR(3) NOT NULL, line_breakdown JSONB NOT NULL DEFAULT '[]'::jsonb CHECK(jsonb_typeof(line_breakdown)='array'),
  reason TEXT NOT NULL, proposal_status TEXT NOT NULL DEFAULT 'draft' CHECK(proposal_status IN ('draft','sent','accepted','rejected','withdrawn','expired')),
  created_by UUID REFERENCES staff_users(id) ON DELETE RESTRICT, sent_at TIMESTAMPTZ,
  customer_decided_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(booking_item_id,proposal_number)
);
CREATE INDEX IF NOT EXISTS idx_booking_price_proposals_history ON booking_price_proposals(booking_item_id,proposal_number DESC);
CREATE TABLE IF NOT EXISTS rescheduling_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), booking_item_id UUID NOT NULL REFERENCES booking_items(id) ON DELETE RESTRICT,
  requested_by_customer UUID REFERENCES customers(id) ON DELETE RESTRICT,
  requested_start_at TIMESTAMPTZ NOT NULL, requested_end_at TIMESTAMPTZ NOT NULL,
  request_status TEXT NOT NULL DEFAULT 'pending' CHECK(request_status IN ('pending','approved','rejected','cancelled')),
  decision_reason TEXT NOT NULL DEFAULT '', decided_by UUID REFERENCES staff_users(id) ON DELETE RESTRICT,
  decided_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), CHECK(requested_start_at<requested_end_at)
);
CREATE TABLE IF NOT EXISTS booking_communication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  booking_item_id UUID REFERENCES booking_items(id) ON DELETE RESTRICT,
  actor_staff_id UUID REFERENCES staff_users(id) ON DELETE RESTRICT,
  channel TEXT NOT NULL CHECK(channel IN ('phone','sms','email','other')),
  direction TEXT NOT NULL CHECK(direction IN ('inbound','outbound','internal')),
  summary TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE, configuration_reference TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS payment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
  attempt_number INTEGER NOT NULL CHECK(attempt_number>0), provider_reference TEXT,
  attempt_status TEXT NOT NULL DEFAULT 'initiated' CHECK(attempt_status IN ('initiated','pending','succeeded','failed','expired')),
  checkout_url TEXT, requested_at TIMESTAMPTZ NOT NULL DEFAULT now(), completed_at TIMESTAMPTZ,
  UNIQUE(payment_id,attempt_number)
);
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), payment_attempt_id UUID NOT NULL REFERENCES payment_attempts(id) ON DELETE RESTRICT,
  provider_event_id TEXT NOT NULL UNIQUE, provider_transaction_id TEXT,
  event_type TEXT NOT NULL, event_status TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK(amount>=0), currency CHAR(3) NOT NULL,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb CHECK(jsonb_typeof(raw_payload)='object'),
  verified_at TIMESTAMPTZ, received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS payment_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
  booking_item_id UUID NOT NULL REFERENCES booking_items(id) ON DELETE RESTRICT,
  allocated_amount NUMERIC(12,2) NOT NULL CHECK(allocated_amount>0), currency CHAR(3) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(payment_id,booking_item_id)
);
CREATE INDEX IF NOT EXISTS idx_payment_allocations_item ON payment_allocations(booking_item_id,created_at);
ALTER TABLE refunds ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id) ON DELETE RESTRICT;
ALTER TABLE refunds ADD COLUMN IF NOT EXISTS booking_item_id UUID REFERENCES booking_items(id) ON DELETE RESTRICT;
ALTER TABLE refunds ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
UPDATE refunds r SET booking_id=p.booking_id FROM payments p WHERE r.payment_id=p.id AND r.booking_id IS NULL;
CREATE TABLE IF NOT EXISTS refund_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), refund_id UUID NOT NULL REFERENCES refunds(id) ON DELETE RESTRICT,
  provider_refund_id TEXT, provider_event_id TEXT UNIQUE,
  amount NUMERIC(12,2) NOT NULL CHECK(amount>0), transaction_status TEXT NOT NULL CHECK(transaction_status IN ('pending','succeeded','failed')),
  provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb CHECK(jsonb_typeof(provider_payload)='object'),
  processed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS booking_item_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), booking_item_id UUID NOT NULL REFERENCES booking_items(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  worker_id UUID REFERENCES workers(id) ON DELETE RESTRICT,
  rating SMALLINT NOT NULL CHECK(rating BETWEEN 1 AND 5), comment TEXT NOT NULL DEFAULT '',
  publication_status TEXT NOT NULL DEFAULT 'pending' CHECK(publication_status IN ('pending','approved','rejected','hidden')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(), moderated_by UUID REFERENCES staff_users(id) ON DELETE RESTRICT,
  moderated_at TIMESTAMPTZ, UNIQUE(booking_item_id,customer_id)
);
CREATE TABLE IF NOT EXISTS notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE RESTRICT,
  channel TEXT NOT NULL CHECK(channel IN ('in_app','push','sms','email')),
  delivery_status TEXT NOT NULL DEFAULT 'queued' CHECK(delivery_status IN ('queued','sent','delivered','failed')),
  provider_reference TEXT, attempted_at TIMESTAMPTZ, error_message TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Required catalogue defaults are already installed by migrations 001, 004,
-- and 005. Role permissions are installed by 002 and subsequent migrations.
-- Never insert synthetic customer, worker, booking, payment, or review records.
