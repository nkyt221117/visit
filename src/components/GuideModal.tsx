import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Table,
  CheckCircle2,
  HelpCircle,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { APPS_SCRIPT_CODE } from '../types';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, title?: string) => void;
  onOpenSettings: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  onOpenSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'steps' | 'code' | 'headers' | 'troubleshoot'>('steps');
  const [isCopiedCode, setIsCopiedCode] = useState(false);
  const [isCopiedHeaders, setIsCopiedHeaders] = useState(false);

  if (!isOpen) return null;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(APPS_SCRIPT_CODE);
      setIsCopiedCode(true);
      onShowToast('Apps Script 코드가 클립보드에 복사되었습니다.', '코드 복사 완료');
      setTimeout(() => setIsCopiedCode(false), 2500);
    } catch {
      onShowToast('복사 권한이 거부되었습니다.', '오류');
    }
  };

  const copyHeaders = async () => {
    try {
      // Tab-separated values paste cleanly into Google Sheets
      const headersTsv = "ID\t작성일시\t작성자\t메시지\t이모지\t카테고리\t좋아요";
      await navigator.clipboard.writeText(headersTsv);
      setIsCopiedHeaders(true);
      onShowToast('헤더 텍스트가 복사되었습니다. 시트 1행 A1에 Ctrl+V 하세요.', '헤더 복사 완료');
      setTimeout(() => setIsCopiedHeaders(false), 2500);
    } catch {
      onShowToast('복사 권한이 거부되었습니다.', '오류');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              田
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                구글 시트 연동 초보자 완벽 가이드
              </h3>
              <p className="text-xs text-slate-500">
                코딩이 처음이어도 5분 만에 무료 스프레드시트 데이터베이스를 구축할 수 있습니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="가이드 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-100 flex gap-2 shrink-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('steps')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'steps'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            1. 5분 완성 단계별 순서
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            2. Apps Script 코드 복사
          </button>
          <button
            onClick={() => setActiveTab('headers')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'headers'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            3. 시트 1행 헤더 구성
          </button>
          <button
            onClick={() => setActiveTab('troubleshoot')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'troubleshoot'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            4. 주의사항 & FAQ
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-sm leading-relaxed">
          {/* TAB 1: Step by Step */}
          {activeTab === 'steps' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  구글 스프레드시트의 <strong>Apps Script</strong> 기능을 이용하면 별도의 서버나 데이터베이스 호스팅 비용 없이, 시트를 실시간 REST JSON API 서버로 무료 활용할 수 있습니다.
                </p>
              </div>

              <div className="space-y-3">
                {/* Step 1 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      1
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      새 구글 스프레드시트 만들기
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 pl-7 leading-relaxed">
                    <a
                      href="https://sheets.new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-0.5 font-medium"
                    >
                      sheets.new <ExternalLink className="w-3 h-3" />
                    </a>
                    로 이동하여 새 구글 시트를 만듭니다. 시트 이름을 '방명록DB' 등으로 정해주세요.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      2
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      헤더(1행) 작성하기
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 pl-7 leading-relaxed">
                    1행 A열부터 G열까지 순서대로 <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">ID, 작성일시, 작성자, 메시지, 이모지, 카테고리, 좋아요</code>를 적습니다. (상단 3번 탭에서 원클릭 복사 가능!)
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      3
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Apps Script 편집기 열기 및 코드 붙여넣기
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 pl-7 leading-relaxed">
                    구글 시트 상단 메뉴에서 <strong>[확장 프로그램] → [Apps Script]</strong>를 클릭합니다. 기본 작성되어 있는 <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">function myFunction() ...</code> 내용을 지우고, 2번 탭의 스크립트 코드를 복사해서 붙여넣은 뒤 <strong>Ctrl+S (저장)</strong>를 누릅니다.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      4
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm text-emerald-950">
                      웹 앱으로 배포하기 (가장 중요한 부분!)
                    </h4>
                  </div>
                  <div className="text-xs text-slate-600 pl-7 space-y-1.5 leading-relaxed">
                    <p>우측 상단 파란색 <strong>[배포] → [새 배포]</strong> 버튼을 누릅니다.</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>유형 선택(톱니바퀴): <strong>웹 앱 (Web App)</strong> 선택</li>
                      <li>설명: <code className="bg-slate-100 px-1 rounded font-mono">시트보드 API</code></li>
                      <li>다음 사용자로 실행: <strong>나 (내 계정)</strong></li>
                      <li>
                        액세스 권한: <strong className="text-rose-600 underline">모든 사용자 (Anyone)</strong> 로 반드시 선택!
                        <span className="block text-[11px] text-slate-500">
                          (이 설정을 '나만'으로 두면 외부 브라우저에서 권한 오류가 발생합니다.)
                        </span>
                      </li>
                    </ul>
                    <p className="pt-1">
                      [배포] 클릭 후 첫 배포 시 구글 권한 승인 창이 뜨면 승인합니다.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      5
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      웹 앱 URL 복사 후 본 앱에 등록
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 pl-7 leading-relaxed">
                    배포 완료 창에 표시되는 <strong>웹 앱 URL</strong> (예: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">https://script.google.com/macros/s/.../exec</code>)을 복사하여 아래의 <strong>[시트 연결 설정]</strong> 창에 붙여넣기만 하면 실시간 동기화가 활성화됩니다!
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    onClose();
                    onOpenSettings();
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  지금 시트 URL 설정하러 가기 →
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Apps Script Code */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Apps Script 소스코드 (Code.gs)
                  </h4>
                  <p className="text-xs text-slate-500">
                    GET(조회), POST(등록/좋아요), LockService 동시성 제어가 내장되어 있습니다.
                  </p>
                </div>
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm shrink-0"
                >
                  {isCopiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>복사 완료!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>코드 전체 복사</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px]">
                  <span>Code.gs</span>
                  <span className="text-slate-500">JavaScript (Google Apps Script)</span>
                </div>
                <pre className="p-4 text-slate-200 overflow-x-auto max-h-[380px] scrollbar-thin text-[11px] leading-relaxed">
                  <code>{APPS_SCRIPT_CODE}</code>
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: Sheet Headers */}
          {activeTab === 'headers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    스프레드시트 1행 열 제목 (헤더) 구성
                  </h4>
                  <p className="text-xs text-slate-500">
                    새 구글 시트 첫 번째 행(A1:G1)에 아래 표와 동일하게 작성합니다.
                  </p>
                </div>
                <button
                  onClick={copyHeaders}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  {isCopiedHeaders ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>헤더 복사됨!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>헤더 일괄 복사 (A1에 붙여넣기)</span>
                    </>
                  )}
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 font-semibold text-slate-700">
                    <tr>
                      <th className="px-3 py-2.5 w-16 text-center">열</th>
                      <th className="px-3 py-2.5">헤더 이름</th>
                      <th className="px-3 py-2.5">설명 및 예시 데이터</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-mono">
                    <tr>
                      <td className="px-3 py-2 text-center font-bold text-slate-900 bg-slate-50">A열</td>
                      <td className="px-3 py-2 font-bold text-slate-800">ID</td>
                      <td className="px-3 py-2 font-sans text-slate-500">고유 식별자 (예: entry_174000...)</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-center font-bold text-slate-900 bg-slate-50">B열</td>
                      <td className="px-3 py-2 font-bold text-slate-800">작성일시</td>
                      <td className="px-3 py-2 font-sans text-slate-500">ISO 표준 일시 (예: 2026-10-01T06:00:00Z)</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-center font-bold text-slate-900 bg-slate-50">C열</td>
                      <td className="px-3 py-2 font-bold text-slate-800">작성자</td>
                      <td className="px-3 py-2 font-sans text-slate-500">작성자 이름 / 닉네임</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-center font-bold text-slate-900 bg-slate-50">D열</td>
                      <td className="px-3 py-2 font-bold text-slate-800">메시지</td>
                      <td className="px-3 py-2 font-sans text-slate-500">응원 한마디 본문 텍스트</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-center font-bold text-slate-900 bg-slate-50">E열</td>
                      <td className="px-3 py-2 font-bold text-slate-800">이모지</td>
                      <td className="px-3 py-2 font-sans text-slate-500">선택한 아이콘 (예: ✨, 🚀, 🎉)</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-center font-bold text-slate-900 bg-slate-50">F열</td>
                      <td className="px-3 py-2 font-bold text-slate-800">카테고리</td>
                      <td className="px-3 py-2 font-sans text-slate-500">분류 (응원, 축하, 일상, 질문)</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-center font-bold text-slate-900 bg-slate-50">G열</td>
                      <td className="px-3 py-2 font-bold text-slate-800">좋아요</td>
                      <td className="px-3 py-2 font-sans text-slate-500">숫자 카운트 (기본 0)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                💡 <strong>자동 생성 팁</strong>: 첫 행을 비워둔 상태로 첫 글을 작성하더라도, 제공된 Apps Script 코드가 헤더가 없으면 첫 행에 위 컬럼들을 자동으로 생성해줍니다.
              </p>
            </div>
          )}

          {/* TAB 4: Troubleshoot & FAQ */}
          {activeTab === 'troubleshoot' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60">
                <div className="flex items-center gap-2 mb-1.5 text-amber-900 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>첫 배포 시 '확인되지 않은 앱' 경고창이 뜰 때 해결법</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  구글 계정 권한 요청 시 "Google에서 확인하지 않은 앱" 화면이 나오면, 좌측 하단의 <strong>[고급 (Advanced)]</strong> 링크를 클릭한 후 <strong>'[프로젝트명](으)로 이동(안전하지 않음)'</strong>을 클릭하면 정상 배포됩니다. 본인이 직접 만든 스크립트이므로 완전히 안전합니다.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h5 className="font-bold text-slate-900 text-xs mb-1">
                    Q. 배포 후 URL을 입력했는데 연결 테스트에 실패합니다.
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    1) 배포 시 <strong>액세스 권한이 '모든 사용자(Anyone)'</strong>로 설정되어 있는지 확인하세요.<br />
                    2) URL 끝이 <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">/exec</code>로 끝나는지 확인하세요 (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">/edit</code>나 테스트용 URL은 동작하지 않습니다).<br />
                    3) 코드를 수정한 뒤에는 반드시 [배포] → [배포 관리]에서 새 버전을 생성해야 변경사항이 반영됩니다.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h5 className="font-bold text-slate-900 text-xs mb-1">
                    Q. 브라우저 CORS 오류 없이 구글 시트에 글이 등록되는 원리가 무엇인가요?
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    일반적인 브라우저는 외부 도메인 POST 전송 시 OPTIONS 사전 요청(Preflight)을 보냅니다. 본 웹앱은 <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">text/plain</code> 인코딩을 활용하여 OPTIONS 요청을 우회하고, Apps Script의 <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">e.postData.contents</code>를 파싱하여 CORS 문제없이 부드럽게 글을 저장합니다.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h5 className="font-bold text-slate-900 text-xs mb-1">
                    Q. 구글 계정이 없어도 방문자가 글을 남길 수 있나요?
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    네! 배포 시 '다음 사용자로 실행: 나', '액세스 권한: 모든 사용자'로 설정했기 때문에, 방문자는 로그인 없이 누구나 웹에서 닉네임과 응원글을 남길 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <span className="text-xs text-slate-400">
            시트보드 Google Sheets Web App 연동 가이드
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
