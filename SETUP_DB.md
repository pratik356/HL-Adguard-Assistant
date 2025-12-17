
# Supabase Database Setup

Run the following SQL in your Supabase SQL Editor to set up the necessary tables and the secure password.

```sql
-- 1. Create a configuration table for storing secrets/settings
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 2. Insert the hashed password for 'Hlsoulcare@7384073556'
-- Hash: 8fb7cbe969c0c8693799d3f18daa42364b70e148d3cf37164355904ed23fe47b
INSERT INTO app_config (key, value)
VALUES ('admin_password_hash', '8fb7cbe969c0c8693799d3f18daa42364b70e148d3cf37164355904ed23fe47b')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 3. Create the conversations table for chat history
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY,
  title TEXT,
  content JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Row Level Security (Optional but recommended)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- 5. Create policies to allow access (For simplicity in this anonymous key setup, we allow public access, 
-- but in production you'd want authenticated access. Since we manage "auth" via the password check 
-- in the app, this relies on the app logic holding the gate.)

-- Allow all operations for anon (since we use the anon key in the app)
CREATE POLICY "Allow public access to conversations"
ON conversations FOR ALL USING (true);

CREATE POLICY "Allow public read of app_config"
ON app_config FOR SELECT USING (true);
```
