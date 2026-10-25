-- Reconcile databases that already applied an earlier catalogue migration.
-- Retired rows remain for historical booking and worker-service references.
UPDATE services SET is_active=FALSE,updated_at=now()
WHERE id NOT IN ('handyman_plumbing','gardening_outdoor','office_cleaning','elder_companion','childcare_nanny','cooking_service','maid_laundry','premium_home_cleaning');

INSERT INTO services(id,name,description,pricing_type,base_price,currency,unit,estimated_duration_minutes,image,is_active)
VALUES
('handyman_plumbing','Minor Home Repairs','Small household repairs, fittings, and maintenance. Share the issue and our team will review the work and price with you.','quotation',150,'USD','after scope review',60,'https://images.unsplash.com/photo-1505798577917-a65157d3320a?auto=format&fit=crop&w=800&q=80',TRUE),
('gardening_outdoor','Gardening & Outdoor','Garden care and outdoor upkeep for homes. Tell us about the space and the work you have in mind.','quotation',0,'ETB','after scope review',60,'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80',TRUE),
('office_cleaning','Office & Commercial Cleaning','Cleaning requests for offices and commercial spaces. Scope and schedule are reviewed before confirmation.','quotation',0,'ETB','after scope review',60,'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80',TRUE),
('elder_companion','Elder Companion Care','Companion support requests for older adults. Share the kind of support and preferred schedule for a careful review.','quotation',0,'ETB','after scope review',60,'https://images.unsplash.com/photo-1576765608866-5b51046452b6?auto=format&fit=crop&w=800&q=80',TRUE),
('childcare_nanny','Childcare & Babysitting','Childcare support for infants, toddlers, and school-age children. Share care requirements for review.','quotation',150,'USD','after scope review',60,'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',TRUE),
('cooking_service','Personal Cooking','In-home meal preparation. Tell us about the menu, dietary needs, and occasion.','quotation',250,'USD','after scope review',90,'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',TRUE),
('maid_laundry','Laundry & Ironing','Laundry, ironing, and garment care requests for your household. Final scope is reviewed with you.','quotation',35,'USD','after scope review',180,'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=800&q=80',TRUE),
('premium_home_cleaning','Premium Home Cleaning','Thoughtful home cleaning for apartments and villas, with the requested rooms and priorities agreed before a visit.','quotation',25,'USD','after scope review',120,'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',TRUE)
ON CONFLICT(id) DO UPDATE SET
 name=EXCLUDED.name,description=EXCLUDED.description,pricing_type='quotation',unit=EXCLUDED.unit,
 estimated_duration_minutes=EXCLUDED.estimated_duration_minutes,image=EXCLUDED.image,is_active=TRUE,updated_at=now();
