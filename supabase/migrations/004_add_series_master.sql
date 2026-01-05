-- シリーズマスタテーブル作成（ノーマルカード総枚数管理）
-- カードラッシュの検索形式: 【AR】{079/078} の「/078」部分

CREATE TABLE IF NOT EXISTS series_master (
  code VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  total_normal_cards INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 初期データ投入
-- 各シリーズのノーマルカード総枚数（カードラッシュで確認した値）
INSERT INTO series_master (code, name, total_normal_cards) VALUES
  -- スカーレットex / バイオレットex
  ('sv1s', 'スカーレットex', 78),
  ('sv1v', 'バイオレットex', 78),
  ('sv1a', 'トリプレットビート', 73),

  -- ポケモンカード151
  ('sv2a', 'ポケモンカード151', 165),
  ('sv2d', 'クレイバースト', 71),
  ('sv2p', 'スノーハザード', 71),

  -- 黒炎の支配者 / レイジングサーフ
  ('sv3', '黒炎の支配者', 62),
  ('sv3a', 'レイジングサーフ', 62),

  -- 古代の咆哮 / 未来の一閃 / シャイニートレジャーex
  ('sv4k', '古代の咆哮', 66),
  ('sv4m', '未来の一閃', 66),
  ('sv4a', 'シャイニートレジャーex', 190),

  -- ワイルドフォース / サイバージャッジ / クリムゾンヘイズ
  ('sv5k', 'ワイルドフォース', 71),
  ('sv5m', 'サイバージャッジ', 71),
  ('sv5a', 'クリムゾンヘイズ', 66),

  -- 変幻の仮面 / ナイトワンダラー
  ('sv6', '変幻の仮面', 64),
  ('sv6a', 'ナイトワンダラー', 64),

  -- ステラミラクル
  ('sv7', 'ステラミラクル', 64),
  ('sv7a', '超電ブレイカー', 70),

  -- パラダイムトリガー
  ('sv8', 'パラダイムトリガー', 106),
  ('sv8a', 'テラスタルフェス', 90),

  -- プロモカード（SV-Pを使用）
  ('promo', 'プロモカード', 0)  -- プロモは「SV-P」固定
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  total_normal_cards = EXCLUDED.total_normal_cards;

-- インデックス
CREATE INDEX IF NOT EXISTS idx_series_master_code ON series_master(code);
