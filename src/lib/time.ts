/** Returns epoch ms of midnight today in local time */
export function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Returns epoch ms for a given dayOffset from today at `hour` (default 18:00 local) */
export function at(dayOffset: number, hour = 18): number {
  return startOfToday() + dayOffset * 86_400_000 + hour * 3_600_000;
}

/** Format deadline as 'Fri, 4 Oct · 18:00' */
export function formatDeadline(ts: number): string {
  const d = new Date(ts);
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
  const day = d.getDate();
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  return `${weekday}, ${day} ${month} · ${hours}:${mins}`;
}

/** Format relative time as 'in 2d 4h', '3h ago', 'just now' */
export function formatRelative(ts: number, now?: number): string {
  const n = now ?? Date.now();
  const diff = ts - n;
  const absDiff = Math.abs(diff);
  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';

  let parts = '';
  if (days > 0) parts += `${days}d `;
  if (hours % 24 > 0) parts += `${hours % 24}h`;
  if (!parts && minutes > 0) parts = `${minutes}m`;
  parts = parts.trim();

  return diff > 0 ? `in ${parts}` : `${parts} ago`;
}

/** Returns local date key as YYYY-MM-DD */
export function dateKey(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}
