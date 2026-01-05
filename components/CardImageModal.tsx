'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { CardWithOwnership } from '@/types';
import { SERIES_TOTAL_CARDS } from '@/lib/constants';

interface CardImageModalProps {
  card: CardWithOwnership;
  onClose: () => void;
}

export default function CardImageModal({ card, onClose }: CardImageModalProps) {
  const imageSrc = card.image_path || '/placeholder-card.png';

  // カードラッシュの検索URL生成
  // 形式: 【AR】{079/078} [SV1S] または 【AR】{232/SV-P}（プロモ）
  const getCardRushSearchUrl = useCallback(() => {
    const paddedCardNumber = card.card_number.padStart(3, '0');
    const upperSeriesCode = card.series_code.toUpperCase();
    const lowerSeriesCode = card.series_code.toLowerCase();

    // シリーズの総枚数を取得
    const totalCards = SERIES_TOTAL_CARDS[lowerSeriesCode];

    let searchQuery: string;
    if (upperSeriesCode === 'PROMO' || totalCards === 'SV-P') {
      // プロモカード: 【AR】{232/SV-P}
      searchQuery = `【${card.rarity}】{${paddedCardNumber}/SV-P}`;
    } else if (totalCards !== undefined) {
      // 通常シリーズ: 【AR】{079/078} [SV1S]
      const paddedTotal = String(totalCards).padStart(3, '0');
      searchQuery = `【${card.rarity}】{${paddedCardNumber}/${paddedTotal}} [${upperSeriesCode}]`;
    } else {
      // 未知のシリーズ: 旧形式を使用
      searchQuery = `【${card.rarity}】{${paddedCardNumber}} [${upperSeriesCode}]`;
    }
    return `https://www.cardrush-pokemon.jp/product-list?keyword=${encodeURIComponent(searchQuery)}`;
  }, [card.rarity, card.card_number, card.series_code]);

  // ESCキーで閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // スクロール無効化
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80"
      onClick={onClose}
    >
      {/* 閉じるボタン */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        aria-label="閉じる"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="white"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* カード画像 */}
      <div
        className="relative w-[80vw] max-w-[400px] aspect-[63/88]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={imageSrc}
          alt={card.name}
          fill
          sizes="80vw"
          className="object-contain rounded-xl"
          unoptimized={imageSrc.startsWith('http')}
          priority
        />
      </div>

      {/* カード情報 */}
      <div
        className="mt-4 text-center text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-lg font-bold">{card.name}</p>
        <p className="text-sm text-white/70">
          {card.series_code} #{card.card_number} ({card.rarity})
        </p>
        {card.price !== undefined && (
          <p className="text-orange-400 font-bold mt-1">
            ¥{card.price.toLocaleString()}
          </p>
        )}
      </div>

      {/* カードラッシュリンクボタン */}
      <a
        href={getCardRushSearchUrl()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="mt-6 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full flex items-center gap-2 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
          />
        </svg>
        カードラッシュで検索
      </a>
    </div>
  );
}
