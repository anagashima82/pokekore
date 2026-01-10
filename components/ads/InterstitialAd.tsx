'use client';

import { useEffect, useRef, useState } from 'react';
import { isPremiumUser } from '@/lib/premium';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface InterstitialAdProps {
  onClose: () => void;
  adSlot?: string;
}

const CLOSE_DELAY_SECONDS = 5;

export default function InterstitialAd({ onClose, adSlot = '1122334455' }: InterstitialAdProps) {
  const adRef = useRef<HTMLModElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [countdown, setCountdown] = useState(CLOSE_DELAY_SECONDS);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    // プレミアム会員は即座に閉じる
    if (isPremiumUser()) {
      onClose();
      return;
    }

    // AdSense IDが設定されていない場合はスキップ
    if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID) return;

    // 広告の初期化
    try {
      if (adRef.current && !isLoaded) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setIsLoaded(true);
      }
    } catch (err) {
      console.error('AdSense interstitial error:', err);
    }
  }, [isLoaded, onClose]);

  // カウントダウンタイマー
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanClose(true);
    }
  }, [countdown]);

  // スクロール無効化
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // ESCキーで閉じる（canClose時のみ）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && canClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canClose, onClose]);

  // プレミアム会員は非表示
  if (isPremiumUser()) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      {/* 閉じるボタン */}
      <button
        type="button"
        onClick={canClose ? onClose : undefined}
        disabled={!canClose}
        className={`absolute top-4 right-4 z-50 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-all ${
          canClose
            ? 'bg-white/90 hover:bg-white text-gray-800 cursor-pointer'
            : 'bg-white/30 text-white/70 cursor-not-allowed'
        }`}
        aria-label={canClose ? '閉じる' : `${countdown}秒後に閉じられます`}
      >
        {canClose ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span className="text-sm font-bold">{countdown}</span>
        )}
      </button>

      {/* 広告コンテンツ */}
      <div className="w-[90vw] max-w-[400px] bg-white rounded-2xl overflow-hidden shadow-2xl">
        {/* ヘッダー */}
        <div className="bg-gray-100 px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-gray-500">広告</span>
          {!canClose && (
            <span className="text-xs text-gray-400">
              {countdown}秒後に閉じられます
            </span>
          )}
        </div>

        {/* 広告エリア */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ? (
          <div className="min-h-[300px]">
            <ins
              ref={adRef}
              className="adsbygoogle"
              style={{ display: 'block', width: '100%', minHeight: '300px' }}
              data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
              data-ad-slot={adSlot}
              data-ad-format="auto"
              data-full-width-responsive="true"
              data-ad-test={process.env.NODE_ENV === 'development' ? 'on' : undefined}
            />
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-12 h-12 mx-auto mb-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"
                />
              </svg>
              <p className="text-sm">広告（開発環境）</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
