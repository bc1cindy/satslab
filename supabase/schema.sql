-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE badge_type AS ENUM ('virtual', 'ordinal');

-- Users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    public_key TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Module progress table
CREATE TABLE module_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Using public key directly
    module_id INTEGER NOT NULL,
    completed_questions INTEGER[] DEFAULT '{}',
    completed_tasks INTEGER[] DEFAULT '{}',
    hints_used INTEGER[] DEFAULT '{}',
    time_spent INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    badge_earned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

-- Badges table
CREATE TABLE badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Using public key directly
    badge_name TEXT NOT NULL,
    badge_type badge_type NOT NULL,
    module_id INTEGER NOT NULL,
    metadata JSONB,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wallets table
CREATE TABLE wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    public_key TEXT NOT NULL,
    network TEXT NOT NULL DEFAULT 'signet',
    balance BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, address)
);

-- Transactions table
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tx_id TEXT NOT NULL,
    amount BIGINT NOT NULL,
    fee BIGINT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    block_height INTEGER,
    confirmations INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (public_key = current_setting('app.current_user_public_key', true));
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (public_key = current_setting('app.current_user_public_key', true));
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (public_key = current_setting('app.current_user_public_key', true));

-- Module progress policies
CREATE POLICY "Users can view own progress" ON module_progress FOR SELECT USING (user_id = current_setting('app.current_user_public_key', true));
CREATE POLICY "Users can insert own progress" ON module_progress FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_public_key', true));
CREATE POLICY "Users can update own progress" ON module_progress FOR UPDATE USING (user_id = current_setting('app.current_user_public_key', true));

-- Badges policies
CREATE POLICY "Users can view own badges" ON badges FOR SELECT USING (user_id = current_setting('app.current_user_public_key', true));
CREATE POLICY "Users can insert own badges" ON badges FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_public_key', true));

-- Wallets policies
CREATE POLICY "Users can view own wallets" ON wallets FOR SELECT USING (user_id IN (SELECT id FROM users WHERE public_key = current_setting('app.current_user_public_key', true)));
CREATE POLICY "Users can insert own wallets" ON wallets FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE public_key = current_setting('app.current_user_public_key', true)));
CREATE POLICY "Users can update own wallets" ON wallets FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE public_key = current_setting('app.current_user_public_key', true)));

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (user_id IN (SELECT id FROM users WHERE public_key = current_setting('app.current_user_public_key', true)));
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE public_key = current_setting('app.current_user_public_key', true)));

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_module_progress_updated_at BEFORE UPDATE ON module_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for better performance
CREATE INDEX idx_module_progress_user_id ON module_progress(user_id);
CREATE INDEX idx_module_progress_module_id ON module_progress(module_id);
CREATE INDEX idx_badges_user_id ON badges(user_id);
CREATE INDEX idx_badges_module_id ON badges(module_id);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_address ON wallets(address);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_tx_id ON transactions(tx_id);