import React, { useState } from 'react';
import {
  X,
  Database,
  Link,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCcw,
  Sparkles,
  BookOpen,
  Trash2,
} from 'lucide-react';
import { testGasConnection } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gasUrl: string;
  isDemoMode: boolean;
  onSaveGasUrl: (url: string) => void;
  onToggleDemoMode: (enabled: boolean) => void;
  onResetDemoData: () => void;
  onShowToast: (msg: string, title?: string, type?: 'success' | 'error' | 'info') => void;
  onOpenGuide: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  gasUrl,
  isDemoMode,
  onSaveGasUrl,
  onToggleDemoMode,
  onResetDemoData,
  onShowToast,
  onOpenGuide,
}) => {
  const [inputUrl, setInputUrl] = useState(gasUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      setTestResult({ ok: false, message: '구글 앱스 스크립트 웹 앱 URL을 먼저 입력해주세요.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testGasConnection(trimmed);
      setTestResult({ ok: result.ok, message: result.message });
      if (result.ok) {
        onShowToast(result.message, '연결 성공', 'success');
      } else {
        onShowToast(result.message, '연결 실패', 'error');
      }
    } catch (err: any) {
      setTestResult({ ok: false, message: err.message || '연결 테스트 중 오류 발생' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const trimmed = inputUrl.trim();
    onSaveGasUrl(trimmed);
    if (trimmed && isDemoMode) {
      onToggleDemoMode(false); // Automatically switch to live when URL is saved
    }
    onShowToast(
      trimmed ? '시트 웹 앱 URL이 저장되었습니다.' : 'URL이 비워졌습니다. 체험 모드로 작동합니다.',
      '설정 저장',
      'success'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                구글 시트 연동 설정
              </h3>
              <p className="text-xs text-slate-500">
                스프레드시트 Apps Script Web App URL을 연결합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="설정창 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          {/* URL Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="gas-url-input" className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-slate-500" />
                <span>웹 앱 배포 URL (Web App URL)</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGuide();
                }}
                className="text-blue-600 hover:underline flex items-center gap-1 text-[11px] font-medium cursor-pointer"
              >
                <BookOpen className="w-3 h-3" />
                <span>URL 생성 방법 보기</span>
              </button>
            </div>

            <div className="space-y-2">
              <input
                id="gas-url-input"
                type="url"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  setTestResult(null);
                }}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || !inputUrl.trim()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>연결 확인 중...</span>
                    </>
                  ) : (
                    <span>연결 테스트</span>
                  )}
                </button>

                {inputUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputUrl('');
                      setTestResult(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 text-[11px] cursor-pointer"
                  >
                    지우기
                  </button>
                )}
              </div>
            </div>

            {/* Test Result Message */}
            {testResult && (
              <div
                className={`mt-2.5 p-3 rounded-xl border flex items-start gap-2 ${
                  testResult.ok
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {testResult.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <p className="leading-relaxed text-[11px]">{testResult.message}</p>
              </div>
            )}
          </div>

          <div className="h-px bg-slate-100" />

          {/* Mode Switch: Demo vs Live */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="pr-3">
              <span className="font-semibold text-slate-800 block text-xs">
                체험 모드 (로컬 데이터)
              </span>
              <span className="text-[11px] text-slate-500">
                구글 시트 URL 없이 브라우저 로컬 저장소로 방명록을 테스트합니다.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={isDemoMode}
                onChange={(e) => onToggleDemoMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
            </label>
          </div>

          {/* Sample Data Reset */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => {
                if (confirm('샘플 데이터로 방명록 목록을 초기화하시겠습니까?')) {
                  onResetDemoData();
                  onShowToast('샘플 방명록 데이터가 초기화되었습니다.', '초기화 완료', 'info');
                }
              }}
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>샘플 방명록 데이터로 되돌리기</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            설정 저장
          </button>
        </div>
      </div>
    </div>
  );
};
