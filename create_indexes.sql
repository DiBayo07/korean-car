CREATE INDEX IF NOT EXISTS idx_brand ON encar_cars(brand);
CREATE INDEX IF NOT EXISTS idx_model ON encar_cars(model);
CREATE INDEX IF NOT EXISTS idx_updated ON encar_cars(date_post_updated DESC);
CREATE INDEX IF NOT EXISTS idx_brand_model ON encar_cars(brand, model);
