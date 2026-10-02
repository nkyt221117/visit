export type CategoryType = '응원' | '축하' | '일상' | '질문' | '기타';

export interface GuestbookEntry {
  id: string;
  createdAt: string;
  name: string;
  message: string;
  emoji: string;
  category: CategoryType;
  likes: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

export type SortOption = 'newest' | 'likes' | 'oldest';

export const CATEGORIES: { label: string; value: CategoryType | '전체' }[] = [
  { label: '전체보기', value: '전체' },
  { label: '🔥 응원해요', value: '응원' },
  { label: '🎉 축하해요', value: '축하' },
  { label: '☕ 일상/소통', value: '일상' },
  { label: '💡 질문/피드백', value: '질문' },
];

export const EMOJI_OPTIONS = [
  '✨', '🍀', '💖', '🔥', '🚀', '☕', '🎉', '🌟', '🌈', '🌸', '👏', '🏆',
  '🎈', '💪', '🥳', '🎯'
];

export const DEFAULT_SAMPLE_ENTRIES: GuestbookEntry[] = [
  {
    id: 'sample-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    name: '민준 (Minjun)',
    message: '구글 스프레드시트로 이렇게 빠르고 깔끔한 방명록이 완성되다니 정말 신기하네요! 프로젝트 성공을 응원합니다. 화이팅입니다!',
    emoji: '🚀',
    category: '응원',
    likes: 8
  },
  {
    id: 'sample-2',
    createdAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    name: '지우 (Jiwoo)',
    message: '새로운 서비스 런칭을 진심으로 축하드려요! 디자인이 모던하고 가독성이 너무 좋습니다. 앞으로도 자주 방문할게요 🎉',
    emoji: '🎉',
    category: '축하',
    likes: 14
  },
  {
    id: 'sample-3',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    name: '서연 (Frontend Dev)',
    message: '초보자도 구글 앱스 스크립트(GAS)로 무료 데이터베이스를 쉽게 연동할 수 있어서 너무 유용하네요. 코드 가이드도 꼼꼼해서 좋습니다.',
    emoji: '🍀',
    category: '일상',
    likes: 19
  },
  {
    id: 'sample-4',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    name: '하늘 (Sky)',
    message: '모두 오늘 하루도 힘내시고 좋은 일만 가득하시길 바라요! 긍정의 에너지를 팍팍 전해드립니다 ✨💪',
    emoji: '✨',
    category: '응원',
    likes: 11
  },
  {
    id: 'sample-5',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    name: '도윤 (Doyun)',
    message: '시트 연동 후 데이터 실시간으로 들어오는 것 테스트해봤는데 체감 반응속도 아주 좋네요! 좋은 템플릿 감사합니다.',
    emoji: '🔥',
    category: '질문',
    likes: 7
  }
];

export const APPS_SCRIPT_CODE = `/**
 * [구글 앱스 스크립트 (Google Apps Script) 코드]
 * 시트보드(SheetGuestbook) 전용 JSON API 스크립트
 * 
 * 1. 스프레드시트 1행 헤더 구성:
 *    [A열] ID | [B열] 작성일시 | [C열] 작성자 | [D열] 메시지 | [E열] 이모지 | [F열] 카테고리 | [G열] 좋아요
 * 
 * 2. 배포 가이드:
 *    - 상단 우측 [배포] -> [새 배포] 클릭
 *    - 유형 선택: [웹 앱] (Web App)
 *    - 다음 사용자로 실행: [나] (Me)
 *    - 액세스 권한: [모든 사용자] (Anyone)  <- 중요!
 *    - 배포 후 복사한 "웹 앱 URL (https://script.google.com/macros/s/.../exec)"을 앱의 설정에 붙여넣기
 */

// 데이터 조회 (GET 요청)
function doGet(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    
    // 첫 행이 비어있으면 기본 헤더 자동 생성
    if (data.length === 0 || (data.length === 1 && data[0][0] === "")) {
      sheet.appendRow(["ID", "작성일시", "작성자", "메시지", "이모지", "카테고리", "좋아요"]);
      return createJsonResponse({ status: "success", data: [] });
    }
    
    var entries = [];
    
    // 2번째 행부터 데이터 변환
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (!row[0] && !row[2] && !row[3]) continue; // 빈 행 건너뛰기
      
      entries.push({
        id: String(row[0] || ("entry_" + i + "_" + new Date().getTime())),
        createdAt: row[1] ? (row[1] instanceof Date ? row[1].toISOString() : String(row[1])) : new Date().toISOString(),
        name: String(row[2] || "익명"),
        message: String(row[3] || ""),
        emoji: String(row[4] || "✨"),
        category: String(row[5] || "응원"),
        likes: Number(row[6]) || 0
      });
    }
    
    return createJsonResponse({
      status: "success",
      count: entries.length,
      data: entries
    });
    
  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

// 데이터 등록 및 수정 (POST 요청)
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var payload = {};
    
    // 본문 데이터 추출 (JSON 형식 또는 폼 데이터)
    if (e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (err) {
        payload = e.parameter || {};
      }
    } else if (e.parameter) {
      payload = e.parameter;
    }
    
    var action = payload.action || "create";
    
    // 좋아요(Like) 증가 액션
    if (action === "like" && payload.id) {
      var data = sheet.getDataRange().getValues();
      for (var r = 1; r < data.length; r++) {
        if (String(data[r][0]) === String(payload.id)) {
          var currentLikes = Number(data[r][6]) || 0;
          sheet.getRange(r + 1, 7).setValue(currentLikes + 1);
          return createJsonResponse({
            status: "success",
            id: payload.id,
            likes: currentLikes + 1
          });
        }
      }
      return createJsonResponse({ status: "error", message: "항목을 찾을 수 없습니다." });
    }
    
    // 새 방명록 추가
    var id = payload.id || Utilities.getUuid();
    var now = payload.createdAt || new Date().toISOString();
    var name = payload.name || "익명";
    var message = payload.message || "";
    var emoji = payload.emoji || "✨";
    var category = payload.category || "응원";
    var likes = Number(payload.likes) || 0;
    
    sheet.appendRow([id, now, name, message, emoji, category, likes]);
    
    return createJsonResponse({
      status: "success",
      message: "방명록이 등록되었습니다.",
      data: {
        id: id,
        createdAt: now,
        name: name,
        message: message,
        emoji: emoji,
        category: category,
        likes: likes
      }
    });
    
  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

// CORS 친화적 JSON 반환 헬퍼
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
