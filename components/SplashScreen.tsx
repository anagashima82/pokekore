'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface SplashScreenProps {
  onFinish: () => void;
  duration?: number; // スプラッシュ表示時間（ミリ秒）
}

export default function SplashScreen({
  onFinish,
  duration = 3000,
}: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // 指定時間後にフェードアウト開始
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, duration);

    // フェードアウト完了後にonFinishを呼ぶ
    const finishTimer = setTimeout(() => {
      onFinish();
    }, duration + 500); // 500msのフェードアウト時間

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [duration, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <Image
          src="/splash.gif"
          alt="ポケコレ"
          fill
          className="object-contain"
          priority
          unoptimized // GIFアニメーションを有効にするため
        />
      </div>
    </div>
  );
}
