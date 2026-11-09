CREATE TABLE IF NOT EXISTS agaz_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  visitor_key_hash TEXT,
  language TEXT NOT NULL DEFAULT 'auto' CHECK(language IN ('auto','en','am','om')),
  title TEXT NOT NULL DEFAULT 'New conversation' CHECK(length(title)<=120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  CHECK ((customer_id IS NULL) <> (visitor_key_hash IS NULL))
);
CREATE INDEX IF NOT EXISTS idx_agaz_conversations_customer_updated ON agaz_conversations(customer_id,updated_at DESC) WHERE customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agaz_conversations_visitor_updated ON agaz_conversations(visitor_key_hash,updated_at DESC) WHERE visitor_key_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agaz_conversations_expiry ON agaz_conversations(expires_at);

CREATE TABLE IF NOT EXISTS agaz_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES agaz_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK(role IN ('user','model')),
  content TEXT NOT NULL CHECK(length(content) BETWEEN 1 AND 2000),
  suggested_service_id TEXT REFERENCES services(id) ON DELETE SET NULL,
  suggested_package_id UUID REFERENCES service_packages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_agaz_messages_conversation_created ON agaz_messages(conversation_id,created_at);
