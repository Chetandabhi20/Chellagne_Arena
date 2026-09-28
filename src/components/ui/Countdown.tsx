import { useNow } from '../../hooks';

export const Countdown = ({ to, prefix = 'Closes in' }: { to: number, prefix?: string }) => {
  const now = useNow(1000);
  const diff = Math.max(0, to - now);
  
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  
  return <span className="font-mono text-muted">{prefix} {d}d {h}h</span>;
};
