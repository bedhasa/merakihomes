INSERT INTO permissions(id,description) VALUES
  ('customers.manage','Update customer account status and profile details used by Operations')
ON CONFLICT DO NOTHING;

INSERT INTO staff_role_permissions(role_id,permission_id) VALUES
  ('admin','customers.manage'),
  ('operations','customers.manage')
ON CONFLICT DO NOTHING;
