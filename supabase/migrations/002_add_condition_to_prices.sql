-- card_pricesテーブルにcondition（状態）とfetched_date（取得日）カラムを追加

-- conditionカラム追加（normal, A-, B など）
ALTER TABLE card_prices ADD COLUMN IF NOT EXISTS condition VARCHAR(20) NOT NULL DEFAULT 'normal';

-- fetched_dateカラム追加（同日重複チェック用）
ALTER TABLE card_prices ADD COLUMN IF NOT EXISTS fetched_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- fetched_dateのインデックス（重複チェック高速化）
CREATE INDEX IF NOT EXISTS idx_card_prices_fetched_date ON card_prices(fetched_date);

-- card_id + fetched_date + condition の複合インデックス（削除・検索高速化）
CREATE INDEX IF NOT EXISTS idx_card_prices_card_date_condition ON card_prices(card_id, fetched_date, condition);

-- 削除ポリシー追加（サービスロールが古いデータを削除できるように）
CREATE POLICY "Service role can delete card prices" ON card_prices
  FOR DELETE USING (true);

-- 最新価格ビューを更新（conditionも含める）
DROP VIEW IF EXISTS latest_card_prices;
CREATE VIEW latest_card_prices AS
SELECT DISTINCT ON (card_id, condition)
  id,
  card_id,
  price,
  condition,
  source,
  fetched_at
FROM card_prices
ORDER BY card_id, condition, fetched_at DESC;
