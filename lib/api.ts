import type {
  Card,
  UserCollection,
  CollectionSetting,
  CollectionStats,
  Rarity,
  CardPrice,
} from '@/types';

// Next.js API Routesを使用（同一オリジン）
const API_BASE_URL = '/api';

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// カード関連API
export async function getCards(params?: {
  series_code?: string;
  rarity?: string;
}): Promise<Card[]> {
  const searchParams = new URLSearchParams();
  if (params?.series_code) searchParams.set('series_code', params.series_code);
  if (params?.rarity) searchParams.set('rarity', params.rarity);

  const query = searchParams.toString();
  return fetchApi<Card[]>(`/cards${query ? `?${query}` : ''}`);
}

export async function getCard(id: string): Promise<Card> {
  return fetchApi<Card>(`/cards/${id}`);
}

export async function getSeries(): Promise<string[]> {
  return fetchApi<string[]>('/cards/series');
}

export async function getRarities(): Promise<Rarity[]> {
  return fetchApi<Rarity[]>('/cards/rarities');
}

// コレクション関連API
export async function getCollections(params?: {
  owned?: boolean;
  series_code?: string;
  rarity?: string;
}): Promise<UserCollection[]> {
  const searchParams = new URLSearchParams();
  if (params?.owned !== undefined) searchParams.set('owned', String(params.owned));
  if (params?.series_code) searchParams.set('card__series_code', params.series_code);
  if (params?.rarity) searchParams.set('card__rarity', params.rarity);

  const query = searchParams.toString();
  return fetchApi<UserCollection[]>(`/collections${query ? `?${query}` : ''}`);
}

export async function toggleCollection(cardId: string): Promise<UserCollection> {
  return fetchApi<UserCollection>(`/collections/${cardId}`, {
    method: 'PUT',
  });
}

export async function getCollectionStats(): Promise<CollectionStats> {
  return fetchApi<CollectionStats>('/collections/stats');
}

// 設定関連API
export async function getSettings(): Promise<CollectionSetting[]> {
  return fetchApi<CollectionSetting[]>('/settings');
}

export async function updateSetting(
  rarity: string,
  isCollecting: boolean
): Promise<CollectionSetting> {
  return fetchApi<CollectionSetting>(`/settings/${rarity}`, {
    method: 'PUT',
    body: JSON.stringify({ is_collecting: isCollecting }),
  });
}

// 認証関連API
export async function initializeUser(): Promise<void> {
  await fetchApi<{ message: string }>('/auth/init', {
    method: 'POST',
  });
}

// 価格関連API
export async function getCardPrices(): Promise<CardPrice[]> {
  return fetchApi<CardPrice[]>('/prices');
}
