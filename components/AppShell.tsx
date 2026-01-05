'use client';

import { useState, useEffect } from 'react';
import SplashScreen from './SplashScreen';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [showSplash, setShowSplash] = useState(true);
  const [hasShownSplash, setHasShownSplash] = useState(false);

  useEffect(() => {
    // セッション中に既にスプラッシュを表示したかチェック
    const splashShown = sessionStorage.getItem('splashShown');
    if (splashShown) {
      setShowSplash(false);
      setHasShownSplash(true);
    }
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
    setHasShownSplash(true);
    sessionStorage.setItem('splashShown', 'true');
  };

  // 初回チェック中は何も表示しない（ちらつき防止）
  if (!hasShownSplash && typeof window !== 'undefined') {
    const splashShown = sessionStorage.getItem('splashShown');
    if (splashShown) {
      return <>{children}</>;
    }
  }

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      <div className={showSplash ? 'invisible' : 'visible'}>{children}</div>
    </>
  );
}
