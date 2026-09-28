import { useEffect, useState } from 'react';
import { useReducedMotion } from '../../hooks';

export const CountUp = ({ value, prefix = '', suffix = '' }: { value: number, prefix?: string, suffix?: string }) => {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced) { setDisplay(value); return; }
    let start = 0;
    const end = value;
    if (start === end) return;
    const duration = 1000;
    const startTime = performance.now();
    
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.floor(ease * (end - start) + start));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, reduced]);

  return <span className="font-mono">{prefix}{display}{suffix}</span>;
};
