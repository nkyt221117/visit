import React, { useState } from 'react';
import { Heart, Copy, Check, MessageSquareOff } from 'lucide-react';
import { GuestbookEntry } from '../types';
import { formatRelativeTime } from '../utils/date';

interface CardGridProps {
  entries: GuestbookEntry[];
  isLoading: boolean;
  onLike: (id: string, currentLikes: number) => Promise<void>;
  onShowToast: (msg: string, title?: string) => void;
  onResetFilters: () => void;
  isFiltered: boolean;
}

export const CardGrid: React.FC<CardGridProps> = ({
  entries,
  isLoading,
  onLike,
  onShowToast,
  onResetFilters,
  isFiltered,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [likingId, setLikingId] = useState<string | null>(null);

  const handleCopy = async (entry: GuestbookEntry) => {
    try {
      const shareText = `[시트보드 방명록]\n"${entry.message}"\n- ${entry.name} (${entry.category})`;
      await navigator.clipboard.writeText(shareText);
      setCopiedId(entry.id);
      onShowToast('응원 메시지가 클립보드에 복사되었습니다.', '복사 완료');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      onShowToast('복사 권한이 제한되었습니다.', '복사 실패');
    }
  };

  const handleLike = async (entry: GuestbookEntry) => {
    if (likingId === entry.id) return;
    setLikingId(entry.id);
    try {
      await onLike(entry.id, entry.likes);
    } finally {
      setTimeout(() => setLikingId(null), 300);
    }
  };

  // Skeleton Loading State
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3.5 bg-slate-100 rounded w-full" />
              <div className="h-3.5 bg-slate-100 rounded w-4/5" />
            </div>
            <div className="pt-2 flex justify-between items-center border-t border-slate-100">
              <div className="h-5 bg-slate-100 rounded w-12" />
              <div className="h-5 bg-slate-100 rounded w-8" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty State
  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center my-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
          <MessageSquareOff className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">
          {isFiltered ? '검색 결과가 없습니다' : '아직 등록된 응원글이 없습니다'}
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4 leading-relaxed">
          {isFiltered
            ? '검색어나 선택된 카테고리를 변경하거나 필터를 초기화해보세요.'
            : '상단의 입력 폼에서 따뜻한 첫 번째 응원 한마디를 남겨보세요!'}
        </p>
        {isFiltered ? (
          <button
            onClick={onResetFilters}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            검색 필터 초기화
          </button>
        ) : (
          <a
            href="#write-form-section"
            className="inline-block px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
          >
            첫 응원글 남기기
          </a>
        )}
      </div>
    );
  }

  // Populated Grid State
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {entries.map((entry) => {
        const isLiking = likingId === entry.id;
        const isCopied = copiedId === entry.id;

        return (
          <article
            key={entry.id}
            className="group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-sm p-5 flex flex-col justify-between transition-all duration-200"
          >
            <div>
              {/* Header: Avatar & Zero-Pill Unboxed Metadata */}
              <div className="flex items-start gap-3 mb-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                  {entry.emoji || '✨'}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {entry.name}
                  </h4>
                  {/* Zero-Pill: Clean unboxed text with typographic separators */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <span className="font-medium text-slate-600">{entry.category || '응원'}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <time dateTime={entry.createdAt} className="tabular-nums">
                      {formatRelativeTime(entry.createdAt)}
                    </time>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line break-words mb-4">
                {entry.message}
              </p>
            </div>

            {/* Card Action Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              {/* Like / Cheer button */}
              <button
                type="button"
                onClick={() => handleLike(entry)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  entry.likes > 0
                    ? 'text-rose-600 hover:bg-rose-50'
                    : 'text-slate-500 hover:text-rose-600 hover:bg-slate-50'
                } ${isLiking ? 'scale-110' : ''}`}
                title="응원 하트 보내기"
                aria-label={`좋아요 ${entry.likes}개`}
              >
                <Heart
                  className={`w-3.5 h-3.5 transition-colors ${
                    entry.likes > 0 ? 'fill-rose-500 text-rose-500' : ''
                  }`}
                />
                <span className="font-mono tabular-nums font-medium">
                  {entry.likes}
                </span>
              </button>

              {/* Share / Copy Action */}
              <button
                type="button"
                onClick={() => handleCopy(entry)}
                className="flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                title="내용 복사하기"
                aria-label="응원글 복사"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[11px] text-emerald-600 font-medium">복사됨</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px] hidden sm:inline">복사</span>
                  </>
                )}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
};
