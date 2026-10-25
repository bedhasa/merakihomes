ALTER TABLE bookings ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES service_packages(id) ON DELETE RESTRICT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS package_name_snapshot TEXT;
CREATE INDEX IF NOT EXISTS idx_bookings_package ON bookings(package_id) WHERE package_id IS NOT NULL;
