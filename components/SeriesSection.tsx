'use client';

import CardItem from './CardItem';
import type { CardWithOwnership } from '@/types';

interface SeriesSectionProps {
  seriesCode: string;
  cards: CardWithOwnership[];
  totalSeriesCards: number;
  ownedSeriesCards: number;
  onToggle: (cardId: string) => void;
  onFavoriteToggle?: (cardId: string) => void;
  updatingCardIds: Set<string>;
  showGrayscale?: boolean;
}

export default function SeriesSection({
  seriesCode,
  cards,
  totalSeriesCards,
  ownedSeriesCards,
  onToggle,
  onFavoriteToggle,
  updatingCardIds,
  showGrayscale = true,
}: SeriesSectionProps) {
  const percentage = totalSeriesCards > 0 ? Math.round((ownedSeriesCards / totalSeriesCards) * 100) : 0;

  return (
    <section className="mb-6" data-series={seriesCode}>
      {/* セクションヘッダー */}
      <div className="sticky top-[57px] z-[5] bg-gray-100 px-4 py-2 flex items-center justify-between">
        <h2 className="font-bold text-gray-800">{seriesCode}</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {ownedSeriesCards} / {totalSeriesCards}
          </span>
          <div className="w-24 h-2 bg-gray-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">{percentage}%</span>
        </div>
      </div>

      {/* カードグリッド */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 px-4 py-2">
        {cards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            onToggle={onToggle}
            onFavoriteToggle={onFavoriteToggle}
            isUpdating={updatingCardIds.has(card.id)}
            showGrayscale={showGrayscale}
          />
        ))}
      </div>
    </section>
  );
}
