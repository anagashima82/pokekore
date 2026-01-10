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
    <div className="sticky top-0 z-10 bg-white border-b border-[#e8eaeb] px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-center gap-3">
        {/* シリーズ選択 */}
        <select
          value={filter.series}
          onChange={(e) => onFilterChange({ ...filter, series: e.target.value })}
          className="rounded-[12px] border border-[#e8eaeb] bg-white px-3 py-2 text-sm text-[#585e5f] focus:border-[#bbebeb] focus:outline-none focus:ring-[4px] focus:ring-[rgba(187,235,235,0.55)] transition-all duration-200"
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
          className="rounded-[12px] border border-[#e8eaeb] bg-white px-3 py-2 text-sm text-[#585e5f] focus:border-[#bbebeb] focus:outline-none focus:ring-[4px] focus:ring-[rgba(187,235,235,0.55)] transition-all duration-200"
        >
          <option value="">全レアリティ</option>
          {rarities.map((r) => (
            <option key={r.code} value={r.code}>
              {r.code} ({r.name})
            </option>
          ))}
        </select>

        {/* 所持状態ボタン */}
        <div className="flex rounded-[12px] border border-[#e8eaeb] overflow-hidden">
          <button
            onClick={() => onFilterChange({ ...filter, owned: 'all' })}
            className={`px-3 py-2 text-sm transition-all duration-200 ${
              filter.owned === 'all'
                ? 'bg-[#bbebeb] text-white'
                : 'bg-white text-[#585e5f] hover:bg-[#f6f7f8]'
            }`}
          >
            全て
          </button>
          <button
            onClick={() => onFilterChange({ ...filter, owned: 'owned' })}
            className={`px-3 py-2 text-sm border-l border-[#e8eaeb] transition-all duration-200 ${
              filter.owned === 'owned'
                ? 'bg-[#bbebeb] text-white'
                : 'bg-white text-[#585e5f] hover:bg-[#f6f7f8]'
            }`}
          >
            所持
          </button>
          <button
            onClick={() => onFilterChange({ ...filter, owned: 'not_owned' })}
            className={`px-3 py-2 text-sm border-l border-[#e8eaeb] transition-all duration-200 ${
              filter.owned === 'not_owned'
                ? 'bg-[#bbebeb] text-white'
                : 'bg-white text-[#585e5f] hover:bg-[#f6f7f8]'
            }`}
          >
            未所持
          </button>
          <button
            onClick={() => onFilterChange({ ...filter, owned: 'favorite' })}
            title="お気に入り"
            aria-label="お気に入り"
            className={`px-3 py-2 text-sm border-l border-[#e8eaeb] transition-all duration-200 ${
              filter.owned === 'favorite'
                ? 'bg-[#f5a3a3] text-white'
                : 'bg-white text-[#585e5f] hover:bg-[#f6f7f8]'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill={filter.owned === 'favorite' ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
              />
            </svg>
          </button>
        </div>

        {/* グレーアウト表示切替 */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filter.showGrayscale}
            onChange={(e) => onFilterChange({ ...filter, showGrayscale: e.target.checked })}
            className="h-4 w-4 rounded border-[#e8eaeb] text-[#bbebeb] focus:ring-[#bbebeb] focus:ring-offset-0"
          />
          <span className="text-sm text-[#585e5f]">未所持をグレー表示</span>
        </label>
      </div>
    </div>
  );
}
