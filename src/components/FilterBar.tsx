import React from 'react';
import { Search, RefreshCw, X, ArrowUpDown } from 'lucide-react';
import { CATEGORIES, CategoryType, SortOption } from '../types';

interface FilterBarProps {
  selectedCategory: CategoryType | '전체';
  onSelectCategory: (cat: CategoryType | '전체') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalCount: number;
  filteredCount: number;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  totalCount,
  filteredCount,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <div className="space-y-3.5">
      {/* Search & Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="이름이나 응원 메시지 검색..."
            className="w-full pl-9.5 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              aria-label="검색어 지우기"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right side controls: Count, Sort, Refresh */}
        <div className="flex items-center gap-2 justify-between sm:justify-end">
          {/* Total Counter */}
          <span className="text-xs text-slate-500 font-medium tabular-nums shrink-0">
            총 <strong className="text-slate-900 font-bold">{filteredCount}</strong>개
            {filteredCount !== totalCount && (
              <span className="text-slate-400"> (전체 {totalCount}개 중)</span>
            )}
          </span>

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Sort Selector */}
          <div className="relative shrink-0">
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="appearance-none pl-7 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-colors cursor-pointer"
              aria-label="정렬 기준"
            >
              <option value="newest">최신 등록순</option>
              <option value="likes">좋아요 많은순</option>
              <option value="oldest">오래된 순</option>
            </select>
            <ArrowUpDown className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            title="목록 새로고침"
            aria-label="방명록 새로고침"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin text-slate-900' : ''}`}
            />
            <span className="hidden sm:inline">새로고침</span>
          </button>
        </div>
      </div>

      {/* Category Segmented Control */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => onSelectCategory(cat.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
