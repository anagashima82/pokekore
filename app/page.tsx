'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import FilterBar from '@/components/FilterBar';
import CardGrid from '@/components/CardGrid';
import { usePreloadedData } from '@/components/AppShell';
import { toggleCollection, getCollectionStats } from '@/lib/api';
import type {
  UserCollection,
  CollectionStats,
  FilterState,
  CardWithOwnership,
} from '@/types';

export default function Home() {
  // プリロードされたデータを取得
  const {
    cards,
    collections: preloadedCollections,
    series,
    rarities,
    stats: preloadedStats,
    isLoaded,
    error,
    refetch,
  } = usePreloadedData();

  // ローカル状態（更新用）
  const [collections, setCollections] = useState<Map<string, UserCollection>>(preloadedCollections);
  const [stats, setStats] = useState<CollectionStats | undefined>(preloadedStats);
  const [filter, setFilter] = useState<FilterState>({
    series: '',
    rarity: '',
    owned: 'all',
    showGrayscale: true,
  });
  const [updatingCardIds, setUpdatingCardIds] = useState<Set<string>>(new Set());

  // プリロードデータが更新されたら同期
  if (preloadedCollections !== collections && preloadedCollections.size > 0 && collections.size === 0) {
    setCollections(preloadedCollections);
  }
  if (preloadedStats !== stats && preloadedStats && !stats) {
    setStats(preloadedStats);
  }

  // カードと所持状態を統合
  const cardsWithOwnership: CardWithOwnership[] = cards.map((card) => {
    const collection = collections.get(card.id);
    return {
      ...card,
      owned: collection?.owned ?? false,
      collection_id: collection?.id,
    };
  });

  // 所持状態トグル（楽観的更新）
  const handleToggle = async (cardId: string) => {
    // 既に更新中なら無視
    if (updatingCardIds.has(cardId)) return;

    // 楽観的更新
    const currentCollection = collections.get(cardId);
    const newOwned = !currentCollection?.owned;

    setUpdatingCardIds((prev) => new Set([...prev, cardId]));

    // 楽観的にUIを更新
    setCollections((prev) => {
      const newMap = new Map(prev);
      if (currentCollection) {
        newMap.set(cardId, { ...currentCollection, owned: newOwned });
      } else {
        // 新規コレクション（仮のデータ）
        newMap.set(cardId, {
          id: 'temp',
          user_id: '',
          card: cardId,
          card_detail: cards.find((c) => c.id === cardId)!,
          owned: true,
          updated_at: new Date().toISOString(),
        });
      }
      return newMap;
    });

    // 統計も楽観的に更新
    if (stats) {
      setStats({
        ...stats,
        owned: stats.owned + (newOwned ? 1 : -1),
        percentage: Math.round(
          ((stats.owned + (newOwned ? 1 : -1)) / stats.total) * 100 * 10
        ) / 10,
      });
    }

    try {
      const result = await toggleCollection(cardId);
      setCollections((prev) => {
        const newMap = new Map(prev);
        newMap.set(cardId, result);
        return newMap;
      });

      // 統計を再取得
      const newStats = await getCollectionStats();
      setStats(newStats);
    } catch (err) {
      console.error('Failed to toggle collection:', err);
      // 失敗した場合は元に戻す
      if (currentCollection) {
        setCollections((prev) => {
          const newMap = new Map(prev);
          newMap.set(cardId, currentCollection);
          return newMap;
        });
      } else {
        setCollections((prev) => {
          const newMap = new Map(prev);
          newMap.delete(cardId);
          return newMap;
        });
      }
      // 統計も元に戻す
      if (stats) {
        setStats(stats);
      }
    } finally {
      setUpdatingCardIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cardId);
        return newSet;
      });
    }
  };

  // ローディング表示（スプラッシュ後に2回目以降のアクセスで表示）
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4 text-center px-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-16 h-16 text-red-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
            <p className="text-lg font-medium text-gray-800">{error}</p>
            <button
              type="button"
              onClick={refetch}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header stats={stats} />
      <FilterBar
        series={series}
        rarities={rarities}
        filter={filter}
        onFilterChange={setFilter}
      />
      <main>
        <CardGrid
          cards={cardsWithOwnership}
          filter={filter}
          onToggle={handleToggle}
          updatingCardIds={updatingCardIds}
        />
      </main>
    </div>
  );
}
