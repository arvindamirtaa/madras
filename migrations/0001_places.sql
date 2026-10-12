CREATE TABLE places (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  area TEXT NOT NULL CHECK (length(trim(area)) > 0),
  address TEXT NOT NULL CHECK (length(trim(address)) > 0),
  wifi INTEGER DEFAULT NULL CHECK (wifi IS NULL OR wifi IN (0, 1)),
  power_sockets INTEGER DEFAULT NULL CHECK (power_sockets IS NULL OR power_sockets IN (0, 1)),
  work_friendliness TEXT DEFAULT NULL,
  category TEXT NOT NULL DEFAULT 'Restaurant',
  description TEXT NOT NULL DEFAULT '',
  website TEXT DEFAULT NULL,
  sources TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(sources) AND json_type(sources) = 'array'),
  UNIQUE (name, area, address)
);

-- These initial venue details were sourced on 2026-10-12.
-- Wi-Fi, power sockets and work friendliness are unverified and remain NULL.

INSERT INTO places (name, area, address, wifi, power_sockets, work_friendliness, category, description, website, sources) VALUES
  ('Annalakshmi', 'Chetpet', '6, Mayor Ramanathan Salai, Chetpet, Chennai', NULL, NULL, NULL, 'Restaurant', 'Indian vegetarian dining.', 'https://www.annalakshmichennai.com/contact-us/', '["https://www.annalakshmichennai.com/contact-us/"]'),
  ('Buhari', 'Anna Salai', '83, Anna Salai, Mount Road, Chennai', NULL, NULL, NULL, 'Restaurant', 'Biryani, chicken dishes and South Indian food.', 'https://www.buhari.in/', '["https://www.buhari.in/menu"]'),
  ('Mathsya', 'Egmore', '1, Tamil Salai, Egmore, Chennai', NULL, NULL, NULL, 'Restaurant', 'Vegetarian South Indian food and meals.', 'https://www.mathsya.co.in/', '["https://www.mathsya.co.in/contact/","https://www.mathsya.co.in/"]'),
  ('Old Madras Baking Company', 'Alwarpet', '279, TTK Road, Sri Ram Nagar, Alwarpet, Chennai', NULL, NULL, NULL, 'Sweets & bakery', 'Breads, pastries and cakes.', 'https://ombc.in/', '["https://in.linkedin.com/company/oldmadrasbakingcompany","https://www.district.in/dining/chennai/the-old-madras-baking-company-alwarpet"]'),
  ('Sangeetha', 'Mylapore', '24, South Mada Street, Mylapore, Chennai', NULL, NULL, NULL, 'Restaurant', 'Vegetarian Indian food and South Indian tiffin.', 'https://www.sangeethaveg.com/chennai', '["https://www.sangeethaveg.com/chennai","https://www.sangeethaveg.com/about-us"]'),
  ('Sri Krishna Sweets', 'Adyar', '4, 1st Main Road, Gandhi Nagar, Adyar, Chennai', NULL, NULL, NULL, 'Sweets & bakery', 'Indian sweets and savouries.', 'https://srikrishnasweets.com/', '["https://srikrishnasweets.com/pages/sri-krishna-sweets-stores"]'),
  ('Wild Garden at Amethyst', 'Royapettah', 'Amethyst, Whites Road, Royapettah, Chennai', NULL, NULL, NULL, 'Café', 'A café with garden and verandah seating.', 'https://www.amethystchennai.com/wildgarden.html', '["https://www.amethystchennai.com/wildgarden.html"]'),
  ('Writer''s Café', 'Gopalapuram', '98, Peters Road, Gopalapuram, Chennai', NULL, NULL, NULL, 'Café', 'Coffee, café food, desserts and baked goods.', 'https://www.writers.menu/menu/gopalapuram', '["https://www.writers.menu/menu/gopalapuram","https://www.district.in/dining/chennai/writers-cafe-gopalapuram"]');
