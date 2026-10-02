import React from 'react';
import { BookOpen, Settings, CheckCircle2, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  isLive: boolean;
  gasUrl: string;
  onOpenGuide: () => void;
  onOpenSettings: () => void;
  onScrollToWrite: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isLive,
  gasUrl,
  onOpenGuide,
  onOpenSettings,
  onScrollToWrite,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#"
          className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
            田
          </span>
          <span>시트보드</span>
        </a>

        {/* Zone 2: Clean text navigation links / status */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={onScrollToWrite}
            className="hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer"
          >
            응원글 남기기
          </button>
          <button
            onClick={onOpenGuide}
            className="hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer"
          >
            연동 매뉴얼
          </button>
          <div
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer hover:text-slate-800 transition-colors"
            title={isLive ? '구글 스프레드시트 실시간 동기화 중' : '로컬 체험 모드 (설정에서 시트 URL 등록 가능)'}
          >
            {isLive ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-emerald-700 font-medium">구글 시트 연동됨</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>체험 모드 (로컬)</span>
              </>
            )}
          </div>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            aria-label="초보자 가이드 열기"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">초보자</span> 가이드
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-sm cursor-pointer"
            aria-label="시트 연동 설정 열기"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>시트 연결 설정</span>
          </button>
        </div>
      </div>
    </header>
  );
};
