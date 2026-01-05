'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface SectionInfo {
  seriesCode: string;
  element: HTMLElement;
}

interface ScrollScrubberProps {
  /** シリーズコードのリスト（表示順） */
  seriesCodes: string[];
}

export default function ScrollScrubber({ seriesCodes }: ScrollScrubberProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [currentSeries, setCurrentSeries] = useState<string | null>(null);
  const [showLabel, setShowLabel] = useState(false);
  const scrubberRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 現在のスクロール位置に対応するシリーズを取得
  const getCurrentSection = useCallback((): string | null => {
    const headerHeight = 57; // Headerの高さ
    const filterBarHeight = 48; // FilterBarの高さ（おおよそ）
    const offset = headerHeight + filterBarHeight + 10;

    for (const code of seriesCodes) {
      const section = document.querySelector(`[data-series="${code}"]`);
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= offset && rect.bottom > offset) {
          return code;
        }
      }
    }
    // 先頭のセクションが見えている場合
    if (seriesCodes.length > 0) {
      const firstSection = document.querySelector(`[data-series="${seriesCodes[0]}"]`);
      if (firstSection) {
        const rect = firstSection.getBoundingClientRect();
        if (rect.top > 0) {
          return seriesCodes[0];
        }
      }
    }
    // 最後のセクションが見えている場合
    if (seriesCodes.length > 0) {
      return seriesCodes[seriesCodes.length - 1];
    }
    return null;
  }, [seriesCodes]);

  // スクロール位置を監視
  useEffect(() => {
    const handleScroll = () => {
      if (!isDragging) {
        const current = getCurrentSection();
        setCurrentSeries(current);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 初期状態を設定

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isDragging, getCurrentSection]);

  // 指定されたシリーズにスクロール
  const scrollToSeries = useCallback((seriesCode: string) => {
    const section = document.querySelector(`[data-series="${seriesCode}"]`);
    if (section) {
      const headerHeight = 57;
      const filterBarHeight = 48;
      const rect = section.getBoundingClientRect();
      const scrollTop = window.scrollY + rect.top - headerHeight - filterBarHeight;

      window.scrollTo({
        top: scrollTop,
        behavior: isDragging ? 'auto' : 'smooth',
      });
    }
  }, [isDragging]);

  // スクラバー上のY座標からシリーズを計算
  const getSeriesFromY = useCallback((clientY: number): string | null => {
    if (!scrubberRef.current || seriesCodes.length === 0) return null;

    const rect = scrubberRef.current.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    const percentage = Math.max(0, Math.min(1, relativeY / rect.height));
    const index = Math.floor(percentage * seriesCodes.length);
    const clampedIndex = Math.min(index, seriesCodes.length - 1);

    return seriesCodes[clampedIndex];
  }, [seriesCodes]);

  // ドラッグ開始
  const handleDragStart = useCallback((clientY: number) => {
    setIsDragging(true);
    setShowLabel(true);

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    const series = getSeriesFromY(clientY);
    if (series) {
      setCurrentSeries(series);
      scrollToSeries(series);
    }
  }, [getSeriesFromY, scrollToSeries]);

  // ドラッグ中
  const handleDragMove = useCallback((clientY: number) => {
    if (!isDragging) return;

    const series = getSeriesFromY(clientY);
    if (series && series !== currentSeries) {
      setCurrentSeries(series);
      scrollToSeries(series);
    }
  }, [isDragging, getSeriesFromY, currentSeries, scrollToSeries]);

  // ドラッグ終了
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);

    // 少し遅延してラベルを非表示
    hideTimeoutRef.current = setTimeout(() => {
      setShowLabel(false);
    }, 1000);
  }, []);

  // タッチイベント
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handleDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    handleDragMove(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // マウスイベント
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientY);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientY);
    };

    const handleMouseUp = () => {
      handleDragEnd();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // シリーズが少ない場合は表示しない
  if (seriesCodes.length < 3) {
    return null;
  }

  // 現在のシリーズのインデックスからサム位置を計算
  const currentIndex = currentSeries ? seriesCodes.indexOf(currentSeries) : 0;
  const thumbPosition = seriesCodes.length > 1
    ? (currentIndex / (seriesCodes.length - 1)) * 100
    : 0;

  return (
    <>
      {/* スクラバーバー */}
      <div
        ref={scrubberRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        className={`fixed right-1 top-1/2 -translate-y-1/2 z-[100] flex flex-col items-center transition-opacity duration-200 ${
          isDragging ? 'opacity-100' : 'opacity-60 hover:opacity-100'
        }`}
        style={{ height: 'min(60vh, 400px)' }}
      >
        {/* バー背景 */}
        <div className="w-1.5 h-full bg-gray-400/50 rounded-full relative">
          {/* サム（つまみ） */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-4 h-6 bg-blue-500 rounded-full shadow-lg transition-transform ${
              isDragging ? 'scale-125' : ''
            }`}
            style={{
              top: `calc(${thumbPosition}% - 12px)`,
            }}
          />
        </div>
      </div>

      {/* シリーズラベル（ドラッグ中に表示） */}
      {showLabel && currentSeries && (
        <div
          className={`fixed right-10 top-1/2 -translate-y-1/2 z-[100] bg-gray-800 text-white px-4 py-2 rounded-lg shadow-xl text-sm font-bold transition-opacity duration-200 ${
            isDragging ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {currentSeries.toUpperCase()}
        </div>
      )}
    </>
  );
}
