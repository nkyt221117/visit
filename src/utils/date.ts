/**
 * Format ISO date string into readable Korean relative time or date
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const target = new Date(dateString);
    if (isNaN(target.getTime())) return dateString || '방금 전';

    const now = new Date();
    const diffSec = Math.floor((now.getTime() - target.getTime()) / 1000);

    if (diffSec < 45) {
      return '방금 전';
    }
    if (diffSec < 3600) {
      const mins = Math.floor(diffSec / 60);
      return `${mins}분 전`;
    }
    if (diffSec < 86400) {
      const hours = Math.floor(diffSec / 3600);
      return `${hours}시간 전`;
    }
    if (diffSec < 86400 * 7) {
      const days = Math.floor(diffSec / 86400);
      return `${days}일 전`;
    }

    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  } catch {
    return '최근';
  }
}
