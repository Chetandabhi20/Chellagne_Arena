import { useState, useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from '../../hooks';
import { Button } from '../ui';
import { Terminal } from 'lucide-react';

interface CheckoutPanelProps {
  slug: string;
  onCheckout: () => void;
  isCheckedOut: boolean;
}

/**
 * Pre-checkout terminal block: shows `$ git checkout -b challenge/{slug}`
 * and a primary "git checkout" button. On click, types the output
 * over ~700ms then reveals the solver panel.
 */
export function CheckoutPanel({ slug, onCheckout, isCheckedOut }: CheckoutPanelProps) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<'idle' | 'typing' | 'done'>(
    isCheckedOut ? 'done' : 'idle'
  );
  const [typedText, setTypedText] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const outputLine = `Switched to a new branch 'challenge/${slug}'`;

  const startCheckout = useCallback(() => {
    if (phase !== 'idle') return;

    if (reduced) {
      // Instant mode
      setTypedText(outputLine);
      setPhase('done');
      onCheckout();
      return;
    }

    setPhase('typing');
    // Type the output character by character over ~700ms
    const chars = outputLine.split('');
    const interval = 700 / chars.length;
    let idx = 0;

    const type = () => {
      if (idx < chars.length) {
        setTypedText(outputLine.slice(0, idx + 1));
        idx++;
        timerRef.current = setTimeout(type, interval);
      } else {
        setPhase('done');
        onCheckout();
      }
    };

    type();
  }, [phase, reduced, outputLine, onCheckout]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // If already checked out, skip to done
  useEffect(() => {
    if (isCheckedOut && phase === 'idle') {
      setPhase('done');
      setTypedText(outputLine);
    }
  }, [isCheckedOut, phase, outputLine]);

  if (phase === 'done' && isCheckedOut) {
    return null; // Solver panel renders instead
  }

  return (
    <div className="border border-border rounded bg-panel p-4">
      <div className="bg-bg rounded border border-border p-4 font-mono text-sm">
        <div className="flex items-center gap-2 text-muted mb-2">
          <Terminal className="w-4 h-4" />
          <span className="text-xs">terminal</span>
        </div>
        <div className="text-success">
          <span className="text-muted">$ </span>
          git checkout -b challenge/{slug}
        </div>
        {(phase === 'typing' || phase === 'done') && (
          <div className="text-text mt-1">
            {typedText}
            {phase === 'typing' && (
              <span className="inline-block w-2 h-4 bg-text ml-0.5 animate-pulse" />
            )}
          </div>
        )}
      </div>

      {phase === 'idle' && (
        <Button
          variant="primary"
          className="mt-4 w-full"
          onClick={startCheckout}
        >
          git checkout
        </Button>
      )}
    </div>
  );
}
