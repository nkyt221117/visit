import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CategoryType,
  DEFAULT_SAMPLE_ENTRIES,
  GuestbookEntry,
  SortOption,
  ToastMessage,
} from './types';
import {
  fetchGuestbookEntries,
  getLocalEntries,
  getStoredGasUrl,
  isDemoModeEnabled,
  likeGuestbookEntry,
  saveLocalEntries,
  saveStoredGasUrl,
  setDemoModeEnabled,
  submitGuestbookEntry,
} from './services/api';
import { Header } from './components/Header';
import { WriteForm } from './components/WriteForm';
import { FilterBar } from './components/FilterBar';
import { CardGrid } from './components/CardGrid';
import { GuideModal } from './components/GuideModal';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer } from './components/ToastContainer';
import { BookOpen, Sparkles, Database, Heart, ShieldCheck } from 'lucide-react';

export default function App() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [gasUrl, setGasUrl] = useState<string>('');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filters & Sorting
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | '전체'>('전체');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  // Modals & Toasts
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast helper
  const addToast = useCallback(
    (message: string, title?: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, title, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Initialize and load entries
  const loadData = useCallback(
    async (showLoadingSpinner = true, customUrl?: string) => {
      if (showLoadingSpinner) setIsLoading(true);
      setIsRefreshing(true);

      const targetUrl = customUrl !== undefined ? customUrl : getStoredGasUrl();
      const demo = isDemoModeEnabled();

      try {
        const result = await fetchGuestbookEntries(targetUrl);
        setEntries(result.entries);
        setIsLive(result.isLive);
      } catch (err: any) {
        console.warn('Data load error:', err);
        // Fall back to local entries
        const local = getLocalEntries();
        setEntries(local);
        setIsLive(false);
        addToast(
          '구글 시트에서 최신 데이터를 불러오지 못해 로컬 캐시를 표시합니다.',
          '동기화 알림',
          'info'
        );
      } finally {
        if (showLoadingSpinner) setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [addToast]
  );

  // Initial mount
  useEffect(() => {
    const storedUrl = getStoredGasUrl();
    const demo = isDemoModeEnabled();
    setGasUrl(storedUrl);
    setIsDemoMode(demo);
    loadData(true, storedUrl);
  }, [loadData]);

  // Handle new entry submission
  const handleSubmitEntry = async (
    newEntry: Omit<GuestbookEntry, 'id' | 'createdAt' | 'likes'>
  ) => {
    setIsSubmitting(true);
    try {
      const created = await submitGuestbookEntry(newEntry, gasUrl);

      // Optimistically update list at the beginning
      setEntries((prev) => [created, ...prev.filter((item) => item.id !== created.id)]);

      const targetLocation = isLive ? '구글 스프레드시트' : '방명록';
      addToast(
        `"${created.name}"님의 응원 한마디가 ${targetLocation}에 안전하게 등록되었습니다!`,
        '등록 완료 🎉',
        'success'
      );
    } catch (err: any) {
      console.error('Submit error:', err);
      addToast(
        '일시적인 네트워크 지연이 발생했으나 로컬에 임시 저장되었습니다.',
        '등록 안내',
        'info'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle like button
  const handleLike = async (id: string, currentLikes: number) => {
    try {
      const updatedLikes = await likeGuestbookEntry(id, currentLikes, gasUrl);
      setEntries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, likes: updatedLikes } : item))
      );
      addToast('따뜻한 응원 하트를 보냈습니다! ❤️', undefined, 'info');
    } catch (err) {
      console.warn('Like failed:', err);
    }
  };

  // Handle URL change
  const handleSaveGasUrl = (url: string) => {
    saveStoredGasUrl(url);
    setGasUrl(url);
    if (url) {
      setDemoModeEnabled(false);
      setIsDemoMode(false);
      loadData(true, url);
    } else {
      setDemoModeEnabled(true);
      setIsDemoMode(true);
      loadData(true, '');
    }
  };

  // Handle Demo Mode Toggle
  const handleToggleDemoMode = (enabled: boolean) => {
    setDemoModeEnabled(enabled);
    setIsDemoMode(enabled);
    loadData(true, enabled ? '' : gasUrl);
  };

  // Reset sample demo data
  const handleResetDemoData = () => {
    saveLocalEntries(DEFAULT_SAMPLE_ENTRIES);
    setEntries(DEFAULT_SAMPLE_ENTRIES);
  };

  const handleScrollToWrite = () => {
    const el = document.getElementById('write-form-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filtered and Sorted entries
  const filteredEntries = useMemo(() => {
    return entries
      .filter((entry) => {
        // Category filter
        if (selectedCategory !== '전체' && entry.category !== selectedCategory) {
          return false;
        }
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = entry.name.toLowerCase().includes(q);
          const matchMessage = entry.message.toLowerCase().includes(q);
          return matchName || matchMessage;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'likes') {
          return (b.likes || 0) - (a.likes || 0);
        }
        if (sortOption === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        // Default: newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [entries, selectedCategory, searchQuery, sortOption]);

  const isFiltered = selectedCategory !== '전체' || searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Top Navigation Bar */}
      <Header
        isLive={isLive}
        gasUrl={gasUrl}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onScrollToWrite={handleScrollToWrite}
      />

      {/* Hero / Intro Section */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              구글 스프레드시트 기반의 <br className="hidden sm:inline" />
              초간단 실시간 방명록
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              복잡한 백엔드 서버나 DB 구축 없이, 구글 스프레드시트를 실시간 JSON API로 연결하여 사용하는 깔끔하고 가벼운 방명록 게시판입니다.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={handleScrollToWrite}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                응원글 남기기
              </button>
              <button
                onClick={() => setIsGuideOpen(true)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                <span>5분 연동 가이드 & Apps Script 코드</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8">
        {/* Write Guestbook Form */}
        <WriteForm
          isSubmitting={isSubmitting}
          isLive={isLive}
          onSubmit={handleSubmitEntry}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Filter & Search Bar */}
        <FilterBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortOption={sortOption}
          onSortChange={setSortOption}
          totalCount={entries.length}
          filteredCount={filteredEntries.length}
          onRefresh={() => loadData(false)}
          isRefreshing={isRefreshing}
        />

        {/* Guestbook Cards Grid */}
        <CardGrid
          entries={filteredEntries}
          isLoading={isLoading}
          onLike={handleLike}
          onShowToast={(msg, title) => addToast(msg, title, 'info')}
          onResetFilters={() => {
            setSelectedCategory('전체');
            setSearchQuery('');
          }}
          isFiltered={isFiltered}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">시트보드 (SheetGuestbook)</span>
            <span>·</span>
            <span>Google Apps Script JSON Web App 연동</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="hover:text-slate-800 transition-colors cursor-pointer"
            >
              연동 가이드
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-slate-800 transition-colors cursor-pointer"
            >
              API URL 설정
            </button>
            <a
              href="https://sheets.new"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-800 transition-colors"
            >
              새 구글 시트 만들기 ↗
            </a>
          </div>
        </div>
      </footer>

      {/* Beginner Guide Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onShowToast={(msg, title) => addToast(msg, title, 'success')}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        gasUrl={gasUrl}
        isDemoMode={isDemoMode}
        onSaveGasUrl={handleSaveGasUrl}
        onToggleDemoMode={handleToggleDemoMode}
        onResetDemoData={handleResetDemoData}
        onShowToast={addToast}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
