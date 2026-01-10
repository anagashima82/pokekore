'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import CardImageModal from './CardImageModal';
import type { CardWithOwnership } from '@/types';

interface CardItemProps {
  card: CardWithOwnership;
  onToggle: (cardId: string) => void;
  onFavoriteToggle?: (cardId: string) => void;
  isUpdating?: boolean;
  showGrayscale?: boolean;
}

// 長押し時間（ミリ秒）
const LONG_PRESS_DURATION = 500;
// スクロール検出の閾値（ピクセル）
const SCROLL_THRESHOLD = 5;
// 長押し開始までの遅延（スクロール意図を判定するため）
const LONG_PRESS_DELAY = 100;

export default function CardItem({ card, onToggle, onFavoriteToggle, isUpdating, showGrayscale = true }: CardItemProps) {
  const [showModal, setShowModal] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);

  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const delayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pressStartTimeRef = useRef<number>(0);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const isScrollingRef = useRef<boolean>(false);

  const imageSrc = card.image_path || '/placeholder-card.png';
  const shouldGrayscale = showGrayscale && !card.owned;

  // 実際に長押しを開始する（遅延後に呼ばれる）
  const actuallyStartLongPress = useCallback(() => {
    if (isScrollingRef.current) return;

    setIsLongPressing(true);
    setPressProgress(0);
    pressStartTimeRef.current = Date.now();

    // プログレス更新
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - pressStartTimeRef.current;
      const progress = Math.min((elapsed / LONG_PRESS_DURATION) * 100, 100);
      setPressProgress(progress);
    }, 16); // ~60fps

    // 長押し完了タイマー
    pressTimerRef.current = setTimeout(() => {
      onToggle(card.id);
      cancelLongPress();
    }, LONG_PRESS_DURATION);
  }, [card.id, onToggle]);

  // 長押し開始（遅延付き）
  const startLongPress = useCallback((x: number, y: number) => {
    if (isUpdating) return;

    startPosRef.current = { x, y };
    isScrollingRef.current = false;

    // 少し遅延してから長押し開始（スクロール意図を判定するため）
    delayTimerRef.current = setTimeout(() => {
      if (!isScrollingRef.current) {
        actuallyStartLongPress();
      }
    }, LONG_PRESS_DELAY);
  }, [isUpdating, actuallyStartLongPress]);

  // 長押しキャンセル
  const cancelLongPress = useCallback(() => {
    setIsLongPressing(false);
    setPressProgress(0);
    startPosRef.current = null;
    isScrollingRef.current = false;

    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const handleSearchClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    cancelLongPress();
    setShowModal(true);
  };

  const handleFavoriteClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    cancelLongPress();
    onFavoriteToggle?.(card.id);
  };

  // タッチイベントハンドラー（スクロール許可のため）
  const handleTouchStart = (e: React.TouchEvent) => {
    // アイコンボタンの上では長押しを開始しない
    if ((e.target as HTMLElement).closest('[data-icon-button]')) return;
    const touch = e.touches[0];
    startLongPress(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // スクロール中は長押しをキャンセル
    if (startPosRef.current && e.touches[0]) {
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - startPosRef.current.x);
      const dy = Math.abs(touch.clientY - startPosRef.current.y);
      if (dx > SCROLL_THRESHOLD || dy > SCROLL_THRESHOLD) {
        isScrollingRef.current = true;
        cancelLongPress();
      }
    }
  };

  const handleTouchEnd = () => {
    cancelLongPress();
  };

  // マウスイベントハンドラー（デスクトップ用）
  const handleMouseDown = (e: React.MouseEvent) => {
    // アイコンボタンの上では長押しを開始しない
    if ((e.target as HTMLElement).closest('[data-icon-button]')) return;
    startLongPress(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    cancelLongPress();
  };

  const handleMouseLeave = () => {
    cancelLongPress();
  };

  // SVGの円周長（プログレスサークル用）
  const circumference = 2 * Math.PI * 20; // r=20
  const strokeDashoffset = circumference - (pressProgress / 100) * circumference;

  return (
    <>
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onContextMenu={(e) => e.preventDefault()}
        className={`relative aspect-[63/88] w-full overflow-hidden rounded-lg transition-all duration-200 select-none ${
          isUpdating ? 'opacity-50 cursor-wait' : 'cursor-pointer'
        }`}
      >
        {/* カード画像 */}
        <Image
          src={imageSrc}
          alt={card.name}
          fill
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
          className={`object-cover pointer-events-none ${shouldGrayscale ? 'grayscale opacity-50' : ''}`}
          unoptimized={imageSrc.startsWith('http')}
          draggable={false}
        />

        {/* 未所持アイコン */}
        {!card.owned && !isLongPressing && (
          <div className={`absolute inset-0 flex items-center justify-center ${shouldGrayscale ? 'bg-black/30' : ''}`}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/90 shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="#4a4a4a"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>
          </div>
        )}

        {/* 長押しプログレスサークル */}
        {isLongPressing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <svg
              className="w-12 h-12 -rotate-90"
              viewBox="0 0 48 48"
            >
              {/* 背景円 */}
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="4"
              />
              {/* プログレス円 */}
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-none"
              />
            </svg>
          </div>
        )}

        {/* ローディングインジケーター */}
        {isUpdating && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}

        {/* 虫眼鏡アイコン（左上） */}
        <div
          data-icon-button
          onClick={handleSearchClick}
          onTouchEnd={handleSearchClick}
          className="absolute top-1 left-1 p-1 rounded bg-black/50 hover:bg-black/70 transition-colors cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="white"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </div>

        {/* お気に入りハートアイコン（左下） */}
        {onFavoriteToggle && (
          <div
            data-icon-button
            onClick={handleFavoriteClick}
            onTouchEnd={handleFavoriteClick}
            className="absolute bottom-1 left-1 p-1 rounded bg-black/50 hover:bg-black/70 transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill={card.is_favorite ? '#ef4444' : 'none'}
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke={card.is_favorite ? '#ef4444' : 'white'}
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
              />
            </svg>
          </div>
        )}

        {/* カード番号バッジ */}
        <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
          {card.card_number}
        </div>

        {/* 価格バッジ */}
        {card.price !== undefined && (
          <div className="absolute top-1 right-1 rounded bg-orange-500/90 px-1.5 py-0.5 text-xs text-white font-medium">
            ¥{card.price.toLocaleString()}
          </div>
        )}
      </div>

      {/* 画像拡大モーダル */}
      {showModal && (
        <CardImageModal card={card} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
