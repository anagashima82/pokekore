'use client';

import Image from 'next/image';
import type { CardWithOwnership } from '@/types';

interface CardItemProps {
  card: CardWithOwnership;
  onToggle: (cardId: string) => void;
  isUpdating?: boolean;
  showGrayscale?: boolean;
}

export default function CardItem({ card, onToggle, isUpdating, showGrayscale = true }: CardItemProps) {
  const imageSrc = card.image_path || '/placeholder-card.png';
  const shouldGrayscale = showGrayscale && !card.owned;

  return (
    <button
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

      {/* カード番号バッジ */}
      <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
        {card.card_number}
      </div>
    </button>
  );
}
