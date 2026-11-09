-- Safe reference data derived from the active service catalogue. These are
-- categories only; no worker qualifications or coverage areas are implied.
INSERT INTO skills(code,name,description) VALUES
  ('minor_home_repairs','Minor home repairs','General minor household repair and maintenance skill.'),
  ('gardening_outdoor','Gardening and outdoor care','Garden care and outdoor upkeep skill.'),
  ('commercial_cleaning','Commercial cleaning','Office and commercial cleaning skill.'),
  ('elder_companionship','Elder companionship','Non-medical companionship and household support skill.'),
  ('childcare','Childcare','Childcare and babysitting skill; qualification checks remain operational requirements.'),
  ('personal_cooking','Personal cooking','In-home meal preparation skill.'),
  ('laundry_ironing','Laundry and ironing','Laundry, ironing, and garment care skill.'),
  ('home_cleaning','Home cleaning','Residential home cleaning skill.')
ON CONFLICT(code) DO NOTHING;

INSERT INTO service_skill_requirements(service_id,skill_id,is_mandatory)
SELECT mapping.service_id,s.id,TRUE
FROM (VALUES
  ('handyman_plumbing','minor_home_repairs'),
  ('gardening_outdoor','gardening_outdoor'),
  ('office_cleaning','commercial_cleaning'),
  ('elder_companion','elder_companionship'),
  ('childcare_nanny','childcare'),
  ('cooking_service','personal_cooking'),
  ('maid_laundry','laundry_ironing'),
  ('premium_home_cleaning','home_cleaning')
) AS mapping(service_id,skill_code)
JOIN services svc ON svc.id=mapping.service_id
JOIN skills s ON s.code=mapping.skill_code
ON CONFLICT(service_id,skill_id) DO NOTHING;
