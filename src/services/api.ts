import { DEFAULT_SAMPLE_ENTRIES, GuestbookEntry } from '../types';

const STORAGE_KEY_GAS_URL = 'sheetguestbook_gas_url';
const STORAGE_KEY_LOCAL_ENTRIES = 'sheetguestbook_local_entries';
const STORAGE_KEY_DEMO_MODE = 'sheetguestbook_demo_mode';

export function getStoredGasUrl(): string {
  return localStorage.getItem(STORAGE_KEY_GAS_URL) || '';
}

export function saveStoredGasUrl(url: string): void {
  localStorage.setItem(STORAGE_KEY_GAS_URL, url.trim());
}

export function isDemoModeEnabled(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY_DEMO_MODE);
  if (stored === null) {
    // Default to demo mode if no URL is set yet
    return !getStoredGasUrl();
  }
  return stored === 'true';
}

export function setDemoModeEnabled(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY_DEMO_MODE, String(enabled));
}

export function getLocalEntries(): GuestbookEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOCAL_ENTRIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_LOCAL_ENTRIES, JSON.stringify(DEFAULT_SAMPLE_ENTRIES));
      return DEFAULT_SAMPLE_ENTRIES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SAMPLE_ENTRIES;
  }
}

export function saveLocalEntries(entries: GuestbookEntry[]): void {
  localStorage.setItem(STORAGE_KEY_LOCAL_ENTRIES, JSON.stringify(entries));
}

/**
 * Fetch entries from either Google Apps Script or Local Storage
 */
export async function fetchGuestbookEntries(gasUrl?: string): Promise<{ entries: GuestbookEntry[]; isLive: boolean }> {
  const url = (gasUrl || getStoredGasUrl()).trim();
  const demoMode = isDemoModeEnabled();

  if (!url || demoMode) {
    return {
      entries: getLocalEntries(),
      isLive: false,
    };
  }

  // Live GAS Fetch
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    // Adding a timestamp cache-buster prevents cached responses from Google
    const targetUrl = new URL(url);
    targetUrl.searchParams.set('_t', Date.now().toString());

    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`구글 시트 응답 오류 (상태 코드: ${response.status})`);
    }

    const json = await response.json();
    let rawList: any[] = [];

    if (Array.isArray(json)) {
      rawList = json;
    } else if (json && Array.isArray(json.data)) {
      rawList = json.data;
    } else if (json && json.status === 'success' && Array.isArray(json.entries)) {
      rawList = json.entries;
    }

    const parsedEntries: GuestbookEntry[] = rawList.map((item, idx) => ({
      id: String(item.id || item.ID || `entry-${idx}-${Date.now()}`),
      createdAt: item.createdAt || item.작성일시 || new Date().toISOString(),
      name: String(item.name || item.작성자 || '익명'),
      message: String(item.message || item.메시지 || ''),
      emoji: String(item.emoji || item.이모지 || '✨'),
      category: (item.category || item.카테고리 || '응원') as any,
      likes: Number(item.likes ?? item.좋아요 ?? 0),
    }));

    // Cache locally as fallback
    saveLocalEntries(parsedEntries);

    return {
      entries: parsedEntries,
      isLive: true,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.warn('GAS Fetch failed, falling back to local cache:', error);
    // If live fetch fails, fallback to local entries but notify caller
    throw error;
  }
}

/**
 * Add a new entry to Google Apps Script or Local Storage
 */
export async function submitGuestbookEntry(
  newEntry: Omit<GuestbookEntry, 'id' | 'createdAt' | 'likes'>,
  gasUrl?: string
): Promise<GuestbookEntry> {
  const url = (gasUrl || getStoredGasUrl()).trim();
  const demoMode = isDemoModeEnabled();

  const entry: GuestbookEntry = {
    ...newEntry,
    id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    likes: 0,
  };

  if (!url || demoMode) {
    // Save to local storage
    const current = getLocalEntries();
    const updated = [entry, ...current];
    saveLocalEntries(updated);
    return entry;
  }

  // Send to Live Google Apps Script
  // Using text/plain prevents the browser from triggering CORS preflight OPTIONS requests,
  // which Google Apps Script web apps do not handle gracefully.
  const payload = {
    action: 'create',
    id: entry.id,
    createdAt: entry.createdAt,
    name: entry.name,
    message: entry.message,
    emoji: entry.emoji,
    category: entry.category,
    likes: entry.likes,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Also update local cache optimistically
    const current = getLocalEntries();
    saveLocalEntries([entry, ...current]);

    if (response.ok) {
      try {
        const json = await response.json();
        if (json.data && json.data.id) {
          return {
            ...entry,
            ...json.data,
          };
        }
      } catch {
        // GAS may redirect to HTML confirmation; entry is still saved
      }
    }

    return entry;
  } catch (error: any) {
    clearTimeout(timeoutId);
    // Even if CORS or network hiccup happened, update local cache
    const current = getLocalEntries();
    saveLocalEntries([entry, ...current]);
    throw error;
  }
}

/**
 * Increment like count
 */
export async function likeGuestbookEntry(id: string, currentLikes: number, gasUrl?: string): Promise<number> {
  const url = (gasUrl || getStoredGasUrl()).trim();
  const demoMode = isDemoModeEnabled();

  const newLikes = currentLikes + 1;

  // Optimistically update local storage
  const current = getLocalEntries();
  const updated = current.map(item => (item.id === id ? { ...item, likes: newLikes } : item));
  saveLocalEntries(updated);

  if (!url || demoMode) {
    return newLikes;
  }

  try {
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ action: 'like', id }),
      // Non-blocking fire and forget
    }).catch(err => console.warn('Like sync failed:', err));
  } catch (e) {
    console.warn('Like request error:', e);
  }

  return newLikes;
}

/**
 * Test connectivity to Google Apps Script Web App
 */
export async function testGasConnection(url: string): Promise<{ ok: boolean; count: number; message: string }> {
  if (!url || !url.startsWith('https://script.google.com/macros/s/')) {
    return {
      ok: false,
      count: 0,
      message: '올바른 구글 앱스 스크립트 웹 앱 URL 형태가 아닙니다. (https://script.google.com/macros/s/.../exec)',
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const targetUrl = new URL(url);
    targetUrl.searchParams.set('_test', Date.now().toString());

    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        ok: false,
        count: 0,
        message: `HTTP 응답 상태 코드: ${response.status}`,
      };
    }

    const data = await response.json();
    let count = 0;
    if (Array.isArray(data)) count = data.length;
    else if (data && Array.isArray(data.data)) count = data.data.length;

    return {
      ok: true,
      count,
      message: `연결 성공! 현재 시트에 ${count}개의 방명록이 있습니다.`,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return { ok: false, count: 0, message: '요청 시간이 초과되었습니다 (10초). 배포 설정을 확인해주세요.' };
    }
    return {
      ok: false,
      count: 0,
      message: `연결 실패: ${err.message || '네트워크 오류 또는 CORS 정책 위반'}. 배포 시 '액세스 권한: 모든 사용자'인지 확인해주세요.`,
    };
  }
}
