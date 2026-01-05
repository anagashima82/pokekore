-- カード価格テーブル
CREATE TABLE IF NOT EXISTS card_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  price INTEGER NOT NULL,
  source VARCHAR(50) NOT NULL DEFAULT 'cardrush',
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_card_prices_card_id ON card_prices(card_id);
CREATE INDEX IF NOT EXISTS idx_card_prices_fetched_at ON card_prices(fetched_at DESC);

-- 同一カード・同一ソースの最新価格を取得するためのユニーク制約はつけない（履歴保存のため）

-- RLS（Row Level Security）
ALTER TABLE card_prices ENABLE ROW LEVEL SECURITY;

-- 価格は全ユーザーが閲覧可能
CREATE POLICY "Anyone can view card prices" ON card_prices
  FOR SELECT USING (true);

-- 価格の挿入・更新はサービスロールのみ（バッチ処理用）
CREATE POLICY "Service role can insert card prices" ON card_prices
  FOR INSERT WITH CHECK (true);

-- 最新価格を取得するビュー
CREATE OR REPLACE VIEW latest_card_prices AS
SELECT DISTINCT ON (card_id)
  id,
  card_id,
  price,
  source,
  fetched_at
FROM card_prices
ORDER BY card_id, fetched_at DESC;
