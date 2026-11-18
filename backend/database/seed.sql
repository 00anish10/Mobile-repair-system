-- ============================================================================
-- Moon Mobile Repair - Seed data
-- Run AFTER schema.sql. Safe to run multiple times.
-- Demo credentials:
--   admin@moonmobilerepair.com / admin123
--   anishshrestha2007@gmail.com / demo123
-- ============================================================================

BEGIN;

-- Demo users ---------------------------------------------------------------
INSERT INTO users (name, email, password_hash, phone, role)
VALUES
    ('Admin User', 'admin@moonmobilerepair.com',
     '$2a$10$vwWZLubohB2Quw9MuBmILeajhwE882ww2IabJ.xRqWRZF7hYR9yKm',
     '+61 400 123 456', 'admin'),
    ('Anish Shrestha', 'anishshrestha2007@gmail.com',
     '$2a$10$CoW.ZbaKGGeeZK1NfFP58u8rmFo31L1oTTYHJ8Vx/QOrlSUP7Kbg.',
     '+61 412 345 678', 'customer'),
    ('Pooja Karki', 'pooja.karki@gmail.com',
     '$2a$10$CoW.ZbaKGGeeZK1NfFP58u8rmFo31L1oTTYHJ8Vx/QOrlSUP7Kbg.',
     '+61 423 456 789', 'customer')
ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone;

-- Technicians --------------------------------------------------------------
DELETE FROM technicians
WHERE email IN (
    'ramesh@moonmobilerepair.com',
    'priya@moonmobilerepair.com',
    'amit@moonmobilerepair.com',
    'sneha@moonmobilerepair.com',
    'kabir@moonmobilerepair.com'
);

INSERT INTO technicians
    (name, phone, email, specialty, experience_years, avatar, rating, reviews_count,
     vehicle, license_plate, status, completed_jobs, specialties, active_areas)
SELECT * FROM (VALUES
    ('Jack Thompson', '+61 412 345 678', 'jack.thompson@moonmobilerepair.com', 'Screen Repair', 5,
     'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
     4.90, 412, 'Moon Mobile Van #04', 'MMR-404', 'available', 640,
     '["OLED Lamination","Screen Replacement","True Tone Restore"]'::jsonb,
     '["Sydney","Parramatta","Bondi"]'::jsonb),
    ('Priya Nair', '+61 423 456 789', 'priya.nair@moonmobilerepair.com', 'Battery Replacement', 4,
     'https://images.unsplash.com/photo-1522071820081-002f17c491d5?w=200&h=200&fit=crop',
     4.95, 388, 'Moon Mobile Van #12', 'MMR-812', 'available', 512,
     '["Battery Health","Charging Ports","Power IC"]'::jsonb,
     '["Melbourne","St Kilda","Richmond"]'::jsonb),
    ('Liam O''Connor', '+61 434 567 890', 'liam.oconnor@moonmobilerepair.com', 'Water Damage', 6,
     'https://images.unsplash.com/photo-1566703130475-5889f6d497e6?w=200&h=200&fit=crop',
     4.85, 301, 'Moon Mobile Van #02', 'MMR-202', 'on_job', 704,
     '["Ultrasonic Cleaning","Motherboard Repair","Data Recovery"]'::jsonb,
     '["Brisbane","Gold Coast","Sunshine Coast"]'::jsonb),
    ('Sophie Nguyen', '+61 445 678 901', 'sophie.nguyen@moonmobilerepair.com', 'Software Troubleshooting', 3,
     'https://images.unsplash.com/photo-1593642638127-d31411b880d1?w=200&h=200&fit=crop',
     4.88, 256, 'Moon Mobile Van #08', 'MMR-608', 'available', 390,
     '["OS Flashing","Boot Loops","Malware Removal"]'::jsonb,
     '["Perth","Fremantle","Joondalup"]'::jsonb),
    ('Noah Williams', '+61 456 789 012', 'noah.williams@moonmobilerepair.com', 'Hardware Diagnostics', 7,
     'https://images.unsplash.com/photo-1582733894851-c413bcb86a2a?w=200&h=200&fit=crop',
     4.92, 522, 'Moon Mobile Van #06', 'MMR-606', 'available', 890,
     '["Micro-soldering","Logic Board","GPU Repair"]'::jsonb,
     '["Adelaide","Glenelg","Norwood"]'::jsonb)
) AS seed(name, phone, email, specialty, experience_years, avatar, rating, reviews_count,
          vehicle, license_plate, status, completed_jobs, specialties, active_areas)
WHERE NOT EXISTS (
    SELECT 1 FROM technicians WHERE email = seed.email
);

-- Service areas across Australia -------------------------------------------
DELETE FROM service_areas
WHERE city IN ('Kathmandu','Lalitpur','Bhaktapur','Pokhara','Chitwan','Biratnagar','Butwal','Dharan');

INSERT INTO service_areas (city, state, is_available, hubs, response_time_minutes, technicians_count)
VALUES
    ('Sydney', 'New South Wales', TRUE,
     '["Sydney CBD","Surry Hills","Parramatta","Bondi","Chatswood","Newtown","Liverpool","Penrith","Manly","Blacktown"]'::jsonb, 35, 28),
    ('Melbourne', 'Victoria', TRUE,
     '["Melbourne CBD","Richmond","South Yarra","St Kilda","Clayton","Footscray","Brunswick","Dandenong","Frankston","Werribee"]'::jsonb, 35, 26),
    ('Brisbane', 'Queensland', TRUE,
     '["Brisbane CBD","South Bank","Fortitude Valley","Chermside","Mount Gravatt","Indooroopilly","North Lakes","Carindale"]'::jsonb, 40, 18),
    ('Perth', 'Western Australia', TRUE,
     '["Perth CBD","Subiaco","Joondalup","Fremantle","Morley","Cannington","Midland","Rockingham"]'::jsonb, 45, 14),
    ('Adelaide', 'South Australia', TRUE,
     '["Adelaide CBD","Glenelg","Norwood","Prospect","Marion","Modbury","Port Adelaide","Unley"]'::jsonb, 45, 12),
    ('Canberra', 'Australian Capital Territory', TRUE,
     '["Civic","Belconnen","Woden","Tuggeranong","Gungahlin","Braddon","Kingston"]'::jsonb, 45, 8),
    ('Gold Coast', 'Queensland', TRUE,
     '["Surfers Paradise","Southport","Broadbeach","Robina","Coolangatta","Coomera","Burleigh Heads"]'::jsonb, 45, 8),
    ('Newcastle', 'New South Wales', TRUE,
     '["Newcastle CBD","Charlestown","Hamilton","Kotara","Merewether","Wallsend"]'::jsonb, 50, 5),
    ('Sunshine Coast', 'Queensland', TRUE,
     '["Maroochydore","Caloundra","Noosa Heads","Buderim","Nambour","Coolum Beach"]'::jsonb, 50, 5),
    ('Wollongong', 'New South Wales', TRUE,
     '["Wollongong CBD","North Wollongong","Fairy Meadow","Corrimal","Shellharbour"]'::jsonb, 50, 4),
    ('Geelong', 'Victoria', TRUE,
     '["Geelong CBD","Waurn Ponds","Belmont","Torquay","Corio"]'::jsonb, 50, 4),
    ('Hobart', 'Tasmania', TRUE,
     '["Hobart CBD","Sandy Bay","Glenorchy","Kingston","New Town"]'::jsonb, 55, 4),
    ('Darwin', 'Northern Territory', TRUE,
     '["Darwin CBD","Casuarina","Palmerston","Nightcliff","Berrimah"]'::jsonb, 55, 3),
    ('Cairns', 'Queensland', TRUE,
     '["Cairns CBD","Smithfield","Earlville","Gordonvale","Palm Cove"]'::jsonb, 55, 3),
    ('Townsville', 'Queensland', TRUE,
     '["Townsville CBD","Aitkenvale","Kirwan","North Ward","Idalia"]'::jsonb, 55, 3),
    ('Toowoomba', 'Queensland', TRUE,
     '["Toowoomba CBD","East Toowoomba","Kearneys Spring","Harristown","Highfields"]'::jsonb, 55, 3),
    ('Launceston', 'Tasmania', TRUE,
     '["Launceston CBD","Kings Meadows","Prospect","Newstead","Mowbray"]'::jsonb, 55, 2),
    ('Ballarat', 'Victoria', TRUE,
     '["Ballarat CBD","Wendouree","Sebastopol","Alfredton","Brown Hill"]'::jsonb, 55, 2),
    ('Bendigo', 'Victoria', TRUE,
     '["Bendigo CBD","Epsom","Kangaroo Flat","Strathdale","Golden Square"]'::jsonb, 55, 2),
    ('Albury-Wodonga', 'New South Wales / Victoria', TRUE,
     '["Albury CBD","Wodonga","Thurgoona","Lavington","West Albury"]'::jsonb, 60, 2),
    ('Wagga Wagga', 'New South Wales', TRUE,
     '["Wagga Wagga CBD","Turvey Park","Kooringal","Glenfield Park","Estella"]'::jsonb, 60, 2),
    ('Coffs Harbour', 'New South Wales', TRUE,
     '["Coffs Harbour CBD","Toormina","Sawtell","Park Beach","Boambee"]'::jsonb, 60, 1),
    ('Port Macquarie', 'New South Wales', TRUE,
     '["Port Macquarie CBD","Settlement City","Lake Cathie","Wauchope","Lighthouse Beach"]'::jsonb, 60, 1),
    ('Dubbo', 'New South Wales', TRUE,
     '["Dubbo CBD","Orana","South Dubbo","West Dubbo","Delroy Park"]'::jsonb, 60, 1),
    ('Rockhampton', 'Queensland', TRUE,
     '["Rockhampton CBD","North Rockhampton","Gracemere","Berserker","Frenchville"]'::jsonb, 60, 1),
    ('Mackay', 'Queensland', TRUE,
     '["Mackay CBD","North Mackay","South Mackay","Andergrove","Mount Pleasant"]'::jsonb, 60, 1),
    ('Bunbury', 'Western Australia', TRUE,
     '["Bunbury CBD","Australind","Eaton","Dalyellup","Glen Iris"]'::jsonb, 60, 1),
    ('Geraldton', 'Western Australia', TRUE,
     '["Geraldton CBD","Wandina","Sunset Beach","Rangeway","Tarcoola"]'::jsonb, 60, 1),
    ('Mount Gambier', 'South Australia', TRUE,
     '["Mount Gambier CBD","Mount Gambier East","Worrolong","Suttontown","Glenburnie"]'::jsonb, 60, 1),
    ('Whyalla', 'South Australia', TRUE,
     '["Whyalla CBD","Westlands","Stuart","Norrie","New Port"]'::jsonb, 60, 1),
    ('Alice Springs', 'Northern Territory', TRUE,
     '["Alice Springs CBD","Larapinta","Braitling","Ross","Gillen"]'::jsonb, 60, 1),
    ('Katherine', 'Northern Territory', TRUE,
     '["Katherine CBD","Katherine East","Katherine South","Cossack","Lansdowne"]'::jsonb, 60, 1)
ON CONFLICT (city) DO NOTHING;

-- Devices ------------------------------------------------------------------
INSERT INTO devices (name, category, description, image_url)
SELECT * FROM (VALUES
    ('iPhone 15 Pro', 'Smartphone', 'Apple flagship with titanium frame and A17 Pro chip', '/placeholder-iphone.jpg'),
    ('Samsung Galaxy S24', 'Smartphone', 'Samsung flagship with Dynamic AMOLED 2X display', '/placeholder-samsung.jpg'),
    ('iPad Pro', 'Tablet', 'Apple pro tablet with M2 chip and Liquid Retina display', '/placeholder-ipad.jpg'),
    ('Samsung Galaxy Tab', 'Tablet', 'Samsung flagship Android tablet', '/placeholder-tab.jpg'),
    ('Google Pixel', 'Smartphone', 'Pure Android experience with computational photography', '/placeholder-pixel.jpg'),
    ('MacBook Air', 'Laptop', 'Apple ultra-portable laptop with Apple silicon', '/placeholder-macbook.jpg'),
    ('OnePlus 12', 'Smartphone', 'Flagship performance with fast charging', '/placeholder-oneplus.jpg')
) AS seed(name, category, description, image_url)
WHERE NOT EXISTS (SELECT 1 FROM devices);

-- Service categories -------------------------------------------------------
INSERT INTO service_categories
    (slug, title, icon, description, starting_price_rs, warranty_text, popular_models)
VALUES
    ('mobile-repair', 'Mobile Phone Repair', 'Smartphone',
     'Complete diagnostic and repair for all smartphone hardware, screens, motherboards, and sensors.',
     89, 'Up to 12-Month Doorstep Warranty',
     '["iPhone","Samsung Galaxy","Google Pixel","OnePlus"]'::jsonb),
    ('iphone-repair', 'iPhone Repair', 'Apple',
     'Specialized Apple technician service with original display panels, Face ID calibration, and waterproof sealing.',
     149, '1-Year Full Display & Parts Guarantee',
     '["iPhone 16 / 15 Series","iPhone 14 / 13 Pro","iPhone 12 / 11"]'::jsonb),
    ('android-repair', 'Android Repair', 'Cpu',
     'Expert servicing for Samsung, Google Pixel, OnePlus, Xiaomi and OPPO with genuine micro-components.',
     99, '6-Month Comprehensive Warranty',
     '["Samsung S & Z Series","Google Pixel","OnePlus 12 / Nord"]'::jsonb),
    ('tablet-repair', 'Tablet & iPad Repair', 'Tablet',
     'Digitizer glass replacement, USB-C daughterboard fixes, and battery swaps on all iPads and Galaxy Tabs.',
     129, '6 to 12 Months Warranty',
     '["iPad Pro M4 / M2","iPad Air","Galaxy Tab S9"]'::jsonb),
    ('laptop-repair', 'Laptop & Computer Repair', 'Laptop',
     'At-home thermal paste cleaning, keyboard replacements, cracked LCDs, RAM/SSD upgrades, and motherboard repair.',
     149, '6-Month On-Site Guarantee',
     '["MacBook Pro / Air","Dell XPS","ThinkPad","HP Spectre"]'::jsonb),
    ('battery-replacement', 'Battery Replacement', 'BatteryCharging',
     'Restore 100% battery health with safety-tested high-cycle cells done in 25 minutes on-site.',
     79, '6-Month No-Degradation Guarantee',
     '["All iPhones","Samsung Galaxy","MacBook & Laptops"]'::jsonb),
    ('screen-replacement', 'Screen Replacement', 'Monitor',
     'Premium Super AMOLED and OLED precision fit screens with zero ghost touch and full 120Hz support.',
     129, '12-Month Screen Warranty',
     '["Edge Displays","Curved OLEDs","Retina Displays"]'::jsonb),
    ('charging-port', 'Charging Port Repair', 'PlugZap',
     'Fix loose cables, lint damage, burned connector pins, or faulty Type-C and Lightning controller ICs.',
     69, '6-Month Part Warranty',
     '["Type-C Ports","Lightning Ports","MagSafe Connectors"]'::jsonb),
    ('water-damage', 'Water Damage Repair', 'Droplets',
     'Ultrasonic chemical bath to eliminate corrosion, short circuits, and liquid oxidation before it spreads.',
     129, '3-Month Logic Board Guarantee',
     '["Smartphones","Smartwatches","Laptops"]'::jsonb),
    ('software-repair', 'Software & Performance', 'Sliders',
     'Recovery from boot loops, OS updates, data backup and recovery, malware removal, and speed tuning.',
     49, '30-Day Stability Support',
     '["iOS","Android","macOS","Windows 11"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Reviews ------------------------------------------------------------------
DELETE FROM reviews
WHERE booking_id IS NULL
  AND location IN ('Lalitpur','Kathmandu','Pokhara');

INSERT INTO reviews (customer_name, rating, device, repair_type, comment, verified, location)
SELECT * FROM (VALUES
    ('Anish Shrestha', 5, 'iPhone 15 Pro', 'Screen Replacement',
     'Technician arrived in 28 minutes and replaced the OLED in front of me. Flawless.', TRUE, 'Sydney'),
    ('Charlotte Bennett', 5, 'Samsung Galaxy S24', 'Battery Replacement',
     'My phone lasts two days again. Genuine battery and no data was touched.', TRUE, 'Melbourne'),
    ('Oliver Hughes', 4, 'MacBook Air', 'Software Repair',
     'Quick diagnosis and clear pricing. Would book again.', TRUE, 'Brisbane')
) AS seed(customer_name, rating, device, repair_type, comment, verified, location)
WHERE NOT EXISTS (
    SELECT 1 FROM reviews WHERE location = seed.location AND customer_name = seed.customer_name
);

COMMIT;
