'use client';

import type { Rarity, FilterState } from '@/types';

interface FilterBarProps {
  series: string[];
  rarities: Rarity[];
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
}

export default function FilterBar({
  series,
  rarities,
  filter,
  onFilterChange,
}: FilterBarProps) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        {/* シリーズ選択 */}
        <select
          value={filter.series}
          onChange={(e) => onFilterChange({ ...filter, series: e.target.value })}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">全シリーズ</option>
          {series.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* レアリティ選択 */}
        <select
          value={filter.rarity}
          onChange={(e) => onFilterChange({ ...filter, rarity: e.target.value })}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">全レアリティ</option>
          {rarities.map((r) => (
            <option key={r.code} value={r.code}>
              {r.code} ({r.name})
            </option>
          ))}
        </select>

        {/* 所持状態ボタン */}
        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
          <button
            onClick={() => onFilterChange({ ...filter, owned: 'all' })}
            className={`px-3 py-2 text-sm transition-colors ${
              filter.owned === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            全て
          </button>
          <button
            onClick={() => onFilterChange({ ...filter, owned: 'owned' })}
            className={`px-3 py-2 text-sm border-x border-gray-300 transition-colors ${
              filter.owned === 'owned'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            所持
          </button>
          <button
            onClick={() => onFilterChange({ ...filter, owned: 'not_owned' })}
            className={`px-3 py-2 text-sm transition-colors ${
              filter.owned === 'not_owned'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            未所持
          </button>
        </div>

        {/* グレーアウト表示切替 */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filter.showGrayscale}
            onChange={(e) => onFilterChange({ ...filter, showGrayscale: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">未所持をグレー表示</span>
        </label>
      </div>
    </div>
  );
}
