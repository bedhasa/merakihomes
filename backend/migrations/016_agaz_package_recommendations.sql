ALTER TABLE agaz_messages ADD COLUMN IF NOT EXISTS suggested_package_id UUID REFERENCES service_packages(id) ON DELETE SET NULL;
