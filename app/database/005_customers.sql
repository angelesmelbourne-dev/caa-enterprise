CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  tenant_id UUID NOT NULL,

  name TEXT NOT NULL,

  phone TEXT,

  address TEXT,

  notes TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE customers
ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read customers"
ON customers
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow insert customers"
ON customers
FOR INSERT
TO anon
WITH CHECK (true);

GRANT SELECT, INSERT ON customers TO anon;