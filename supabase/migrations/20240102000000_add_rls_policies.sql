-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Allow public access for IP-based authentication
CREATE POLICY "Allow public read access for IP auth" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert for IP auth" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for IP auth" ON users FOR UPDATE USING (true);

-- RLS Policies for user_progress table
CREATE POLICY "Allow public read access to user_progress" ON user_progress FOR SELECT USING (true);
CREATE POLICY "Allow public insert to user_progress" ON user_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to user_progress" ON user_progress FOR UPDATE USING (true);

-- RLS Policies for badges table
CREATE POLICY "Allow public read access to badges" ON badges FOR SELECT USING (true);
CREATE POLICY "Allow public insert to badges" ON badges FOR INSERT WITH CHECK (true);

-- RLS Policies for wallets table
CREATE POLICY "Allow public read access to wallets" ON wallets FOR SELECT USING (true);
CREATE POLICY "Allow public insert to wallets" ON wallets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to wallets" ON wallets FOR UPDATE USING (true);

-- RLS Policies for transactions table
CREATE POLICY "Allow public read access to transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert to transactions" ON transactions FOR INSERT WITH CHECK (true);