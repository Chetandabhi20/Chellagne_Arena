import { useState, useEffect, useRef } from 'react';
import type { SolverProps } from './SolverRegistry';
import { Button } from '../ui/Button';
import ReactCodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

export default function CodeSolver({
  challenge,
  onSubmit,
  onRun,
  isPractice,
  attemptsLeft,
  draft,
  onSaveDraft,
  lastFeedback,
  lastResult,
}: SolverProps) {
  const config = challenge.config;
  if (config.type !== 'code') return null;

  const [code, setCode] = useState<string>((draft as string) || config.starter);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Debounced save draft
  const draftTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (code !== config.starter && code !== draft) {
      if (draftTimer.current !== undefined) clearTimeout(draftTimer.current);
      draftTimer.current = window.setTimeout(() => {
        onSaveDraft(code);
      }, 500);
    }
    return () => {
      if (draftTimer.current !== undefined) clearTimeout(draftTimer.current);
    };
  }, [code, config.starter, draft, onSaveDraft]);

  const handleRun = async () => {
    if (!onRun) return;
    setIsRunning(true);
    await onRun(code);
    setIsRunning(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit(code);
    setIsSubmitting(false);
  };

  const noAttempts = attemptsLeft !== null && attemptsLeft <= 0;
  const disableSubmit = isSubmitting || isRunning || (noAttempts && !isPractice);

  return (
    <div className="flex flex-col gap-4">
      <div className="border border-border rounded overflow-hidden">
        <ReactCodeMirror
          value={code}
          height="320px"
          extensions={[javascript()]}
          theme={oneDark}
          onChange={(value) => setCode(value)}
          basicSetup={{
            lineNumbers: true,
            bracketMatching: true,
            tabSize: 2,
          }}
        />
      </div>

      <div className="flex justify-end gap-3">
        {!isPractice && (
          <Button variant="secondary" onClick={handleRun} disabled={isRunning || isSubmitting}>
            {isRunning ? 'Running...' : 'Run tests'}
          </Button>
        )}
        <Button onClick={handleSubmit} disabled={disableSubmit}>
          {isSubmitting ? 'Submitting...' : noAttempts && !isPractice ? 'No attempts left' : 'Submit'}
        </Button>
      </div>
      
      {lastFeedback && lastFeedback.length > 0 && (
        <div className="mt-4 flex flex-col gap-3">
          <div className="p-4 border border-border rounded bg-panel">
            <h3 className="font-mono text-sm mb-2 text-muted">
              Checks: {lastFeedback.filter(f => f.startsWith('✓')).length} of {lastFeedback.length} passed
            </h3>
            <ul className="space-y-1 font-mono text-sm">
              {lastFeedback.map((f, i) => (
                <li key={i} className={f.startsWith('✓') ? 'text-success' : 'text-danger'}>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          {lastResult?.details && (lastResult.details as any).logs && ((lastResult.details as any).logs.length > 0) && (
            <details className="border border-border rounded bg-panel overflow-hidden">
              <summary className="p-2 cursor-pointer font-mono text-sm text-muted bg-panel-2 hover:bg-border select-none">
                Console Output
              </summary>
              <div className="p-4 bg-bg font-mono text-xs overflow-x-auto text-text space-y-1">
                {((lastResult.details as any).logs as string[]).map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
