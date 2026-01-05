'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import SplashScreen from './SplashScreen';
import {
  getCards,
  getCollections,
  getSeries,
  getRarities,
  getCollectionStats,
  getCardPrices,
  initializeUser,
} from '@/lib/api';
import type {
  Card,
  UserCollection,
  Rarity,
  CollectionStats,
  CardPrice,
} from '@/types';

// プリロードデータの型
interface PreloadedData {
  cards: Card[];
  collections: Map<string, UserCollection>;
  prices: Map<string, CardPrice>;
  series: string[];
  rarities: Rarity[];
  stats: CollectionStats | undefined;
  isLoaded: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// コンテキスト
const PreloadContext = createContext<PreloadedData | null>(null);

export function usePreloadedData() {
  const context = useContext(PreloadContext);
  if (!context) {
    throw new Error('usePreloadedData must be used within AppShell');
  }
  return context;
}

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [showSplash, setShowSplash] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [splashTimerDone, setSplashTimerDone] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [skipSplashAnimation, setSkipSplashAnimation] = useState(false);

  // プリロードデータ
  const [cards, setCards] = useState<Card[]>([]);
  const [collections, setCollections] = useState<Map<string, UserCollection>>(new Map());
  const [prices, setPrices] = useState<Map<string, CardPrice>>(new Map());
  const [series, setSeries] = useState<string[]>([]);
  const [rarities, setRarities] = useState<Rarity[]>([]);
  const [stats, setStats] = useState<CollectionStats | undefined>();
  const [error, setError] = useState<string | null>(null);

  // データ取得関数
  const fetchData = useCallback(async () => {
    try {
      setError(null);

      // 新規ユーザーの場合は初期化
      await initializeUser();

      const [cardsData, collectionsData, seriesData, raritiesData, statsData, pricesData] =
        await Promise.all([
          getCards(),
          getCollections(),
          getSeries(),
          getRarities(),
          getCollectionStats(),
          getCardPrices().catch(() => []), // 価格データがない場合は空配列
        ]);

      setCards(cardsData);

      // コレクションをカードIDでマップ化
      const collectionMap = new Map<string, UserCollection>();
      for (const col of collectionsData) {
        collectionMap.set(col.card, col);
      }
      setCollections(collectionMap);

      // 価格をカードIDでマップ化
      const priceMap = new Map<string, CardPrice>();
      for (const price of pricesData) {
        priceMap.set(price.card_id, price);
      }
      setPrices(priceMap);

      setSeries(seriesData);
      setRarities(raritiesData);
      setStats(statsData);
      setDataLoaded(true);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('データの取得に失敗しました');
      setDataLoaded(true); // エラーでも完了扱い
    }
  }, []);

  useEffect(() => {
    // 常にデータを取得する
    fetchData();

    // セッション中に既にスプラッシュを表示したかチェック
    const splashShown = sessionStorage.getItem('splashShown');
    if (splashShown) {
      // スプラッシュアニメーションをスキップ（ただしデータ読み込みは待つ）
      setSkipSplashAnimation(true);
      setSplashTimerDone(true);
    }
    setIsInitialized(true);
  }, [fetchData]);

  // スプラッシュタイマー完了とデータ読み込み完了の両方を待つ
  useEffect(() => {
    if (splashTimerDone && dataLoaded && showSplash) {
      setShowSplash(false);
      sessionStorage.setItem('splashShown', 'true');
    }
  }, [splashTimerDone, dataLoaded, showSplash]);

  const handleSplashTimerFinish = () => {
    setSplashTimerDone(true);
  };

  // 初期化前は白い画面を表示（ちらつき防止）
  if (!isInitialized) {
    return <div className="fixed inset-0 bg-white" />;
  }

  // データ読み込み中で、スプラッシュアニメーションをスキップする場合は白い画面を表示
  if (skipSplashAnimation && !dataLoaded) {
    return <div className="fixed inset-0 bg-white" />;
  }

  // プリロードデータをコンテキストで提供
  const preloadedData: PreloadedData = {
    cards,
    collections,
    prices,
    series,
    rarities,
    stats,
    isLoaded: dataLoaded,
    error,
    refetch: fetchData,
  };

  return (
    <PreloadContext.Provider value={preloadedData}>
      {showSplash && <SplashScreen onFinish={handleSplashTimerFinish} />}
      <div className={showSplash ? 'invisible' : 'visible'}>{children}</div>
    </PreloadContext.Provider>
  );
}
