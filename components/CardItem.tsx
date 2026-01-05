'use client';

import { useState } from 'react';
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

export default function CardItem({ card, onToggle, onFavoriteToggle, isUpdating, showGrayscale = true }: CardItemProps) {
  const [showModal, setShowModal] = useState(false);

  const imageSrc = card.image_path || '/placeholder-card.png';
  const shouldGrayscale = showGrayscale && !card.owned;

  const handleSearchClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle?.(card.id);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => onToggle(card.id)}
        disabled={isUpdating}
        className={`relative aspect-[63/88] w-full overflow-hidden rounded-lg transition-all duration-200 ${
          isUpdating ? 'opacity-50 cursor-wait' : 'hover:scale-105 active:scale-95'
        } ${shouldGrayscale ? 'grayscale opacity-50' : ''}`}
      >
        {/* カード画像 */}
        <Image
          src={imageSrc}
          alt={card.name}
          fill
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
          className="object-cover"
          unoptimized={imageSrc.startsWith('http')}
        />

        {/* 未所持アイコン */}
        {!card.owned && (
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

        {/* ローディングインジケーター */}
        {isUpdating && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}

        {/* 虫眼鏡アイコン（左上） */}
        <div
          onClick={handleSearchClick}
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
            onClick={handleFavoriteClick}
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
      </button>

      {/* 画像拡大モーダル */}
      {showModal && (
        <CardImageModal card={card} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
