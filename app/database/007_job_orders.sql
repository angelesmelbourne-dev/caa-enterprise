CREATE TABLE job_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  customer_id UUID REFERENCES customers(id),

  vehicle_id UUID REFERENCES vehicles(id),

  status TEXT DEFAULT 'Open',

  complaint TEXT,

  notes TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE job_orders
ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read job_orders"
ON job_orders
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow insert job_orders"
ON job_orders
FOR INSERT
TO anon
WITH CHECK (true);

GRANT SELECT, INSERT ON job_orders TO anon;