'use client';

import { useEffect, useRef, useState } from 'react';
import { isPremiumUser } from '@/lib/premium';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface BannerAdProps {
  adSlot?: string;
}

export default function BannerAd({ adSlot = '1234567890' }: BannerAdProps) {
  const adRef = useRef<HTMLModElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // プレミアム会員は広告非表示
    if (isPremiumUser()) return;

    // AdSense IDが設定されていない場合はスキップ
    if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID) return;

    // 広告の初期化
    try {
      if (adRef.current && !isLoaded) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setIsLoaded(true);
      }
    } catch (err) {
      console.error('AdSense banner error:', err);
    }
  }, [isLoaded]);

  // プレミアム会員は非表示
  if (isPremiumUser()) return null;

  // AdSense IDが設定されていない場合はプレースホルダー表示（開発用）
  if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-200 border-t border-gray-300 safe-area-bottom">
        <div className="h-[50px] flex items-center justify-center text-gray-500 text-sm">
          広告エリア（開発環境）
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-bottom">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '50px' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={adSlot}
        data-ad-format="horizontal"
        data-full-width-responsive="true"
        data-ad-test={process.env.NODE_ENV === 'development' ? 'on' : undefined}
      />
    </div>
  );
}
