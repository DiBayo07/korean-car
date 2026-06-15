-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('car', 'bike', 'salvage')),
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    generation VARCHAR(100),
    trim VARCHAR(100),
    year INTEGER NOT NULL,
    month INTEGER,
    mileage INTEGER NOT NULL, -- in km
    price_usd NUMERIC NOT NULL,
    price_krw NUMERIC, -- Korean Won for bikes
    image_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Available',
    engine_cc INTEGER, -- Engine size for bikes
    korean_name VARCHAR(200), -- Korean title for bikes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security) if desired. For simplicity in this dev environment, we'll allow public reads and writes.
-- Let's create security policies that allow all reads and edits.
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON vehicles
    FOR SELECT USING (true);

CREATE POLICY "Allow public write access" ON vehicles
    FOR ALL USING (true) WITH CHECK (true);

-- Insert Mock Data
INSERT INTO vehicles (type, brand, model, generation, trim, year, month, mileage, price_usd, image_url, status)
VALUES 
('car', 'Hyundai', 'The New Grandeur IG', 'IG', '2.5 Premium Choice', 2020, 1, 58712, 15474, 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=600&auto=format&fit=crop', 'Available'),
('car', 'Hyundai', 'Grandeur IG', 'IG', '2.4 Premium (None)', 2018, 5, 69052, 11622, 'https://images.unsplash.com/photo-1617469767053-d3b508a0d84d?q=80&w=600&auto=format&fit=crop', 'Available'),
('car', 'Hyundai', 'i40', 'VF', '1.7 VGT PYL', 2013, 5, 231607, 2524, 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600&auto=format&fit=crop', 'Available'),
('car', 'Hyundai', 'Palisade', 'LX2', 'Diesel 2.2 4WD Prestige', 2018, 12, 113126, 16536, 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600&auto=format&fit=crop', 'Available'),
('car', 'Genesis', 'G80', 'DH', 'BH330 Luxury Basic', 2008, 5, 99817, 2590, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=600&auto=format&fit=crop', 'Available');

INSERT INTO vehicles (type, brand, model, year, mileage, price_krw, price_usd, image_url, status, engine_cc, korean_name)
VALUES
('bike', 'Royal Enfield', 'Interceptor 650', 2022, 7000, 5200000, 3453, 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=600&auto=format&fit=crop', 'Available', 650, '로얄엔필드 인터셉터 650'),
('bike', 'Yamaha', 'YZF-R3', 2019, 32364, 3000000, 1992, 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=600&auto=format&fit=crop', 'Available', 321, 'YZF-R3'),
('bike', 'Yamaha', 'R7', 2022, 300, 9700000, 6442, 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=600&auto=format&fit=crop', 'Available', 689, 'R7'),
('bike', 'Daelim', 'Citi Ace 110', 2017, 25000, 1500000, 996, 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=600&auto=format&fit=crop', 'Available', 110, '씨티에이스');
