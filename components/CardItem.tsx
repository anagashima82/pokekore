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

export default function CardItem({ card, onToggle, onFavoriteToggle, isUpdating, showGrayscale = true }: CardItemProps) {
  const [showModal, setShowModal] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);

  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pressStartTimeRef = useRef<number>(0);

  const imageSrc = card.image_path || '/placeholder-card.png';
  const shouldGrayscale = showGrayscale && !card.owned;

  // 長押し開始
  const startLongPress = useCallback(() => {
    if (isUpdating) return;

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
  }, [isUpdating, card.id, onToggle]);

  // 長押しキャンセル
  const cancelLongPress = useCallback(() => {
    setIsLongPressing(false);
    setPressProgress(0);

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

  // タッチ/マウスイベントハンドラー
  const handlePointerDown = (e: React.PointerEvent) => {
    // アイコンボタンの上では長押しを開始しない
    if ((e.target as HTMLElement).closest('[data-icon-button]')) return;
    startLongPress();
  };

  const handlePointerUp = () => {
    cancelLongPress();
  };

  const handlePointerLeave = () => {
    cancelLongPress();
  };

  // SVGの円周長（プログレスサークル用）
  const circumference = 2 * Math.PI * 20; // r=20
  const strokeDashoffset = circumference - (pressProgress / 100) * circumference;

  return (
    <>
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerUp}
        onContextMenu={(e) => e.preventDefault()}
        className={`relative aspect-[63/88] w-full overflow-hidden rounded-lg transition-all duration-200 select-none touch-none ${
          isUpdating ? 'opacity-50 cursor-wait' : 'cursor-pointer'
        } ${shouldGrayscale ? 'grayscale opacity-50' : ''}`}
      >
        {/* カード画像 */}
        <Image
          src={imageSrc}
          alt={card.name}
          fill
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
          className="object-cover pointer-events-none"
          unoptimized={imageSrc.startsWith('http')}
          draggable={false}
        />

        {/* 未所持アイコン */}
        {!card.owned && !isLongPressing && (
          <div className={`absolute inset-0 flex items-center justify-center ${shouldGrayscale ? 'bg-black/30' : ''}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke={shouldGrayscale ? 'white' : 'rgba(255,255,255,0.8)'}
              className="h-8 w-8 drop-shadow-lg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
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
