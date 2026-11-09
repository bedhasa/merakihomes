CREATE TABLE IF NOT EXISTS home_promotions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL CHECK(length(title) BETWEEN 2 AND 120),
  body TEXT NOT NULL DEFAULT '' CHECK(length(body) <= 300),
  code TEXT NOT NULL DEFAULT '' CHECK(length(code) <= 40),
  image_url TEXT NOT NULL DEFAULT '' CHECK(length(image_url) <= 1000),
  mobile_image_url TEXT NOT NULL DEFAULT '' CHECK(length(mobile_image_url) <= 1000),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO home_promotions(id,title,body,code,image_url,mobile_image_url,display_order) VALUES
('seasonal','A fresh season, a fresher home','Ask our team about current home-care offers and available service packages.','SEASONAL CARE','https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1400&q=85','',1),
('clean-home','Make room for a little more calm','Explore home cleaning options, with scope and pricing confirmed before booking.','HOME REFRESH','https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1400&q=85','',2),
('garden','Give your garden a good day','Discover outdoor care options sized around your space and priorities.','GARDEN CARE','https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1400&q=85','',3)
ON CONFLICT(id) DO NOTHING;

INSERT INTO permissions(id,description) VALUES ('promotions.manage','Manage home page promotional cards') ON CONFLICT DO NOTHING;
INSERT INTO staff_role_permissions(role_id,permission_id) VALUES ('admin','promotions.manage'),('operations','promotions.manage') ON CONFLICT DO NOTHING;
