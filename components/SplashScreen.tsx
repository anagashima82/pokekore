'use client';

import { useEffect, useState } from 'react';

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
      className={`fixed inset-0 z-50 transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/splash.gif"
        alt="ポケコレ"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
