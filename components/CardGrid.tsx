'use client';

import { useMemo } from 'react';
import SeriesSection from './SeriesSection';
import type { CardWithOwnership, FilterState } from '@/types';

interface CardGridProps {
  cards: CardWithOwnership[];
  filter: FilterState;
  onToggle: (cardId: string) => void;
  updatingCardIds: Set<string>;
}

export default function CardGrid({
  cards,
  filter,
  onToggle,
  updatingCardIds,
}: CardGridProps) {
  // フィルタリングとグループ化
  const groupedCards = useMemo(() => {
    // フィルタリング
    let filtered = cards;

    if (filter.series) {
      filtered = filtered.filter((c) => c.series_code === filter.series);
    }

    if (filter.rarity) {
      filtered = filtered.filter((c) => c.rarity === filter.rarity);
    }

    if (filter.owned === 'owned') {
      filtered = filtered.filter((c) => c.owned);
    } else if (filter.owned === 'not_owned') {
      filtered = filtered.filter((c) => !c.owned);
    }

    // シリーズごとにグループ化
    const grouped = new Map<string, CardWithOwnership[]>();
    for (const card of filtered) {
      const existing = grouped.get(card.series_code) || [];
      grouped.set(card.series_code, [...existing, card]);
    }

    // カード番号でソート
    for (const [series, cardList] of grouped) {
      grouped.set(
        series,
        cardList.sort((a, b) => {
          const numA = parseInt(a.card_number, 10) || 0;
          const numB = parseInt(b.card_number, 10) || 0;
          return numA - numB;
        })
      );
    }

    // シリーズコードでソート
    return Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [cards, filter]);

  if (groupedCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-16 w-16 mb-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z"
          />
        </svg>
        <p className="text-lg font-medium">カードが見つかりません</p>
        <p className="text-sm">フィルターを変更してみてください</p>
      </div>
    );
  }

  return (
    <div className="pb-4">
      {groupedCards.map(([seriesCode, seriesCards]) => (
        <SeriesSection
          key={seriesCode}
          seriesCode={seriesCode}
          cards={seriesCards}
          onToggle={onToggle}
          updatingCardIds={updatingCardIds}
        />
      ))}
    </div>
  );
}
