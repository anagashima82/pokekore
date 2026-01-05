-- Cards table
CREATE TABLE IF NOT EXISTS cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_number VARCHAR(20) NOT NULL,
    series_code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    rarity VARCHAR(10) NOT NULL,
    image_path VARCHAR(255) DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(series_code, card_number)
);

-- User collections table
CREATE TABLE IF NOT EXISTS user_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    owned BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, card_id)
);

-- Collection settings table
CREATE TABLE IF NOT EXISTS collection_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    rarity VARCHAR(10) NOT NULL,
    is_collecting BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, rarity)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cards_series_code ON cards(series_code);
CREATE INDEX IF NOT EXISTS idx_cards_rarity ON cards(rarity);
CREATE INDEX IF NOT EXISTS idx_user_collections_user_id ON user_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_card_id ON user_collections(card_id);
CREATE INDEX IF NOT EXISTS idx_collection_settings_user_id ON collection_settings(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_settings ENABLE ROW LEVEL SECURITY;

-- Policies (allow all for now - MVP version)
CREATE POLICY "Allow all for cards" ON cards FOR ALL USING (true);
CREATE POLICY "Allow all for user_collections" ON user_collections FOR ALL USING (true);
CREATE POLICY "Allow all for collection_settings" ON collection_settings FOR ALL USING (true);
