-- user_collectionsテーブルにis_favoriteカラムを追加
ALTER TABLE user_collections ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;

-- インデックス追加（お気に入りでフィルタリング高速化）
CREATE INDEX IF NOT EXISTS idx_user_collections_favorite ON user_collections(user_id, is_favorite) WHERE is_favorite = TRUE;
