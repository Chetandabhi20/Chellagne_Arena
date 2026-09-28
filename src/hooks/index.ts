import { useEffect, useState } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · Git Club Arena`;
  }, [title]);
}

export function useNow(intervalMs: number = 30000) {
  const [now, setNow] = useState(Date.now());
  
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}

export function useHotkey(key: string, callback: (e: KeyboardEvent) => void, ctrlOrMeta = true) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (ctrlOrMeta && !(e.ctrlKey || e.metaKey)) return;
      if (e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        callback(e);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, ctrlOrMeta]);
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reduced;
}
