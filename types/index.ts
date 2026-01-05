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
  is_favorite: boolean;
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
  owned: 'all' | 'owned' | 'not_owned' | 'favorite';
  showGrayscale: boolean;
}

// カードと所持状態を統合した型
export interface CardWithOwnership extends Card {
  owned: boolean;
  is_favorite: boolean;
  collection_id?: string;
  price?: number;
  price_fetched_at?: string;
}

// カード価格
export interface CardPrice {
  id: string;
  card_id: string;
  price: number;
  condition: string; // 'normal' | 'A-' | 'B' など
  source: string;
  fetched_at: string;
}

// 価格履歴
export interface PriceHistory {
  card_id: string;
  prices: {
    price: number;
    fetched_at: string;
  }[];
}
