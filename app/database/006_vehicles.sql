CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  customer_id UUID REFERENCES customers(id),

  plate_no TEXT NOT NULL,

  make TEXT,

  model TEXT,

  year TEXT,

  color TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE vehicles
ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read vehicles"
ON vehicles
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow insert vehicles"
ON vehicles
FOR INSERT
TO anon
WITH CHECK (true);

GRANT SELECT, INSERT ON vehicles TO anon;