import { useNow } from '../../hooks';

export const Countdown = ({ to, prefix = 'Closes in' }: { to: number, prefix?: string }) => {
  const now = useNow(1000);
  const diff = Math.max(0, to - now);
  
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  
  if (diff <= 0) return <span className="font-mono text-muted">Closed</span>;
  
  let timeStr = `${d}d ${h}h`;
  if (d === 0) {
    if (h > 0) timeStr = `${h}h ${m}m`;
    else timeStr = `${m}m ${s}s`;
  }
  
  return <span className="font-mono text-muted">{prefix} {timeStr}</span>;
};
