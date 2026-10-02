import React, { useState } from 'react';
import { Send, Loader2, Sparkles, Check } from 'lucide-react';
import { CategoryType, EMOJI_OPTIONS, GuestbookEntry } from '../types';

interface WriteFormProps {
  isSubmitting: boolean;
  isLive: boolean;
  onSubmit: (entry: Omit<GuestbookEntry, 'id' | 'createdAt' | 'likes'>) => Promise<void>;
  onOpenSettings: () => void;
}

export const WriteForm: React.FC<WriteFormProps> = ({
  isSubmitting,
  isLive,
  onSubmit,
  onOpenSettings,
}) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [emoji, setEmoji] = useState('✨');
  const [category, setCategory] = useState<CategoryType>('응원');
  const [errorMsg, setErrorMsg] = useState('');

  const MAX_MESSAGE_LENGTH = 250;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedName = name.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName) {
      setErrorMsg('이름 또는 닉네임을 입력해주세요.');
      return;
    }
    if (!trimmedMessage) {
      setErrorMsg('응원 한마디를 작성해주세요.');
      return;
    }
    if (trimmedMessage.length < 2) {
      setErrorMsg('응원 메시지는 최소 2자 이상 입력해주세요.');
      return;
    }

    try {
      await onSubmit({
        name: trimmedName,
        message: trimmedMessage,
        emoji,
        category,
      });

      // Clear input on success
      setMessage('');
      setErrorMsg('');
    } catch (err: any) {
      setErrorMsg(err.message || '등록 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const categories: { label: string; value: CategoryType }[] = [
    { label: '🔥 응원해요', value: '응원' },
    { label: '🎉 축하해요', value: '축하' },
    { label: '☕ 일상/소통', value: '일상' },
    { label: '💡 질문/피드백', value: '질문' },
  ];

  return (
    <div
      id="write-form-section"
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>방명록 남기기</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            따뜻한 응원과 축하의 메시지를 남겨보세요. 스프레드시트에 즉시 기록됩니다.
          </p>
        </div>

        {/* Database Target Status */}
        <div className="shrink-0 flex items-center gap-1.5 text-xs">
          <span className="text-slate-400">저장 대상:</span>
          {isLive ? (
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              구글 시트 실시간 연동
            </span>
          ) : (
            <button
              type="button"
              onClick={onOpenSettings}
              className="text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200 transition-colors cursor-pointer text-left"
            >
              체험 모드 (시트 연동하기)
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* Name & Category Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-6">
            <label
              htmlFor="guest-name"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              작성자 이름 / 닉네임 <span className="text-rose-500">*</span>
            </label>
            <input
              id="guest-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 홍길동, 프론트엔더"
              maxLength={20}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
            />
          </div>

          <div className="sm:col-span-6">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              분류 카테고리
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {categories.map((c) => {
                const isActive = category === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCategory(c.value)}
                    disabled={isSubmitting}
                    className={`px-2 py-2 text-xs font-medium rounded-lg border transition-all truncate text-center ${
                      isActive
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Emoji Avatar Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            이모지 아이콘 선택
          </label>
          <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl">
            {EMOJI_OPTIONS.map((item) => {
              const isSelected = emoji === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setEmoji(item)}
                  disabled={isSubmitting}
                  className={`w-9 h-9 text-base rounded-lg flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-white ring-2 ring-slate-900 shadow-sm scale-110'
                      : 'hover:bg-white/80 opacity-80 hover:opacity-100'
                  }`}
                  aria-label={`이모지 ${item}`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* Message Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="guest-message"
              className="block text-xs font-semibold text-slate-700"
            >
              응원 한마디 <span className="text-rose-500">*</span>
            </label>
            <span
              className={`text-xs tabular-nums ${
                message.length >= MAX_MESSAGE_LENGTH ? 'text-rose-500 font-semibold' : 'text-slate-400'
              }`}
            >
              {message.length} / {MAX_MESSAGE_LENGTH}
            </span>
          </div>
          <textarea
            id="guest-message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="응원, 축하, 따뜻한 피드백을 자유롭게 남겨주세요."
            maxLength={MAX_MESSAGE_LENGTH}
            disabled={isSubmitting}
            className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all resize-none leading-relaxed"
          />
        </div>

        {/* Error Notice */}
        {errorMsg && (
          <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200 font-medium">
            {errorMsg}
          </p>
        )}

        {/* Submit Action Bar */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-slate-400 hidden sm:block">
            팁: <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-600 font-mono text-[10px]">Ctrl/Cmd + Enter</kbd> 키로 바로 등록할 수 있습니다.
          </p>

          <button
            type="submit"
            disabled={isSubmitting || !name.trim() || !message.trim()}
            className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>시트에 저장 중...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>응원글 등록하기</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
