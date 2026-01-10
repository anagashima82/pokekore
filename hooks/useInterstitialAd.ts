'use client';

import { useState, useCallback } from 'react';
import { isPremiumUser } from '@/lib/premium';
import {
  canShowInterstitial,
  recordInterstitialShown,
} from '@/lib/ads/interstitialManager';

interface UseInterstitialAdReturn {
  isShowing: boolean;
  showInterstitial: () => boolean;
  closeAd: () => void;
}

/**
 * インタースティシャル広告の表示制御フック
 */
export function useInterstitialAd(): UseInterstitialAdReturn {
  const [isShowing, setIsShowing] = useState(false);

  const showInterstitial = useCallback((): boolean => {
    // プレミアム会員は表示しない
    if (isPremiumUser()) {
      return false;
    }

    // 表示条件をチェック
    if (!canShowInterstitial()) {
      return false;
    }

    // 広告を表示
    setIsShowing(true);
    recordInterstitialShown();
    return true;
  }, []);

  const closeAd = useCallback(() => {
    setIsShowing(false);
  }, []);

  return {
    isShowing,
    showInterstitial,
    closeAd,
  };
}
