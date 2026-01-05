// カード関連の型定義
export interface Card {
  id: string;
  card_number: string;
  series_code: string;
  name: string;
  rarity: string;
  rarity_display: string;
  image_path: string;
  created_at: string;
}

// コレクション関連の型定義
export interface UserCollection {
  id: string;
  user_id: string;
  card: string;
  card_detail: Card;
  owned: boolean;
  updated_at: string;
}

// 収集設定
export interface CollectionSetting {
  id: string;
  user_id: string;
  rarity: string;
  rarity_display: string;
  is_collecting: boolean;
}

// 収集統計
export interface CollectionStats {
  total: number;
  owned: number;
  percentage: number;
  by_series: SeriesStats[];
}

export interface SeriesStats {
  series_code: string;
  total: number;
  owned: number;
  percentage: number;
}

// レアリティ
export interface Rarity {
  code: string;
  name: string;
}

// API レスポンス型
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// フィルター状態
export interface FilterState {
  series: string;
  rarity: string;
  owned: 'all' | 'owned' | 'not_owned';
  showGrayscale: boolean;
}

// カードと所持状態を統合した型
export interface CardWithOwnership extends Card {
  owned: boolean;
  collection_id?: string;
}
