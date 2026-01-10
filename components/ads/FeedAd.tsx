'use client';

import { useEffect, useRef, useState } from 'react';
import { isPremiumUser } from '@/lib/premium';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface FeedAdProps {
  adSlot?: string;
}

export default function FeedAd({ adSlot = '0987654321' }: FeedAdProps) {
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
      console.error('AdSense feed ad error:', err);
    }
  }, [isLoaded]);

  // プレミアム会員は非表示
  if (isPremiumUser()) return null;

  // AdSense IDが設定されていない場合はプレースホルダー表示（開発用）
  if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID) {
    return (
      <div className="col-span-full my-2">
        <div className="relative bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
          <span className="absolute top-1 left-1 text-[10px] text-gray-400 bg-white/80 px-1 rounded">
            広告
          </span>
          <div className="h-[100px] flex items-center justify-center text-gray-400 text-sm">
            フィード広告（開発環境）
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-full my-2">
      <div className="relative">
        <span className="absolute top-1 left-1 z-10 text-[10px] text-gray-400 bg-white/80 px-1 rounded">
          広告
        </span>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
          data-ad-slot={adSlot}
          data-ad-format="fluid"
          data-ad-layout-key="-fb+5w+4e-db+86"
          data-ad-test={process.env.NODE_ENV === 'development' ? 'on' : undefined}
        />
      </div>
    </div>
  );
}
