-- Keep historical service rows for bookings and worker qualifications, but
-- publish only the current eight catalogue entries.
UPDATE services SET is_active=FALSE,updated_at=now()
WHERE id NOT IN ('handyman_plumbing','gardening_outdoor','office_cleaning','elder_companion','childcare_nanny','cooking_service','maid_laundry','premium_home_cleaning');

INSERT INTO services(id,name,description,pricing_type,base_price,currency,unit,estimated_duration_minutes,image,is_active)
VALUES
('handyman_plumbing','Minor Home Repairs','Small household repairs, fittings, and maintenance. Share the issue and our team will review the work and price with you.','quotation',150,'USD','after scope review',60,'https://images.unsplash.com/photo-1505798577917-a65157d3320a?auto=format&fit=crop&w=800&q=80',TRUE),
('childcare_nanny','Childcare & Babysitting','Childcare support requests for your family. Share ages, schedule, and care needs so we can review the right arrangement.','quotation',150,'USD','after scope review',60,'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',TRUE),
('cooking_service','Personal Cooking','In-home meal preparation requests. Tell us about servings, dietary needs, and ingredient arrangements.','quotation',250,'USD','after scope review',90,'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',TRUE),
('maid_laundry','Laundry & Ironing','Laundry, ironing, and garment care requests for your household. Final scope is reviewed with you.','quotation',35,'USD','after scope review',180,'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=800&q=80',TRUE)
ON CONFLICT(id) DO NOTHING;

UPDATE services SET name='Minor Home Repairs',description='Small household repairs, fittings, and maintenance. Share the issue and our team will review the work and price with you.',pricing_type='quotation',unit='after scope review',updated_at=now() WHERE id='handyman_plumbing';
UPDATE services SET name='Childcare & Babysitting',description='Childcare support requests for your family. Share ages, schedule, and care needs so we can review the right arrangement.',pricing_type='quotation',unit='after scope review',updated_at=now() WHERE id='childcare_nanny';
UPDATE services SET name='Personal Cooking',description='In-home meal preparation requests. Tell us about servings, dietary needs, and ingredient arrangements.',pricing_type='quotation',unit='after scope review',updated_at=now() WHERE id='cooking_service';
UPDATE services SET name='Laundry & Ironing',description='Laundry, ironing, and garment care requests for your household. Final scope is reviewed with you.',pricing_type='quotation',unit='after scope review',updated_at=now() WHERE id='maid_laundry';

INSERT INTO services(id,name,description,pricing_type,base_price,currency,unit,estimated_duration_minutes,image,is_active)
VALUES
('gardening_outdoor','Gardening & Outdoor','Garden care and outdoor upkeep for homes. Tell us about the space and the work you have in mind.','quotation',0,'ETB','after scope review',60,'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80',TRUE),
('office_cleaning','Office & Commercial Cleaning','Cleaning requests for offices and commercial spaces. Scope and schedule are reviewed before confirmation.','quotation',0,'ETB','after scope review',60,'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80',TRUE),
('elder_companion','Elder Companion Care','Companion support requests for older adults. Share the kind of support and preferred schedule for a careful review.','quotation',0,'ETB','after scope review',60,'https://images.unsplash.com/photo-1576765608866-5b51046452b6?auto=format&fit=crop&w=800&q=80',TRUE),
('premium_home_cleaning','Premium Home Cleaning','Thoughtful home cleaning for apartments and villas, with the requested rooms and priorities agreed before a visit.','quotation',25,'USD','after scope review',120,'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',TRUE)
ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,pricing_type='quotation',unit=EXCLUDED.unit,image=EXCLUDED.image,is_active=TRUE,updated_at=now();

UPDATE services SET is_active=TRUE,updated_at=now()
WHERE id IN ('handyman_plumbing','gardening_outdoor','office_cleaning','elder_companion','childcare_nanny','cooking_service','maid_laundry','premium_home_cleaning');
