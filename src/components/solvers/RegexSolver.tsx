import { useState, useEffect, useRef } from 'react';
import type { SolverProps } from './SolverRegistry';
import { Button } from '../ui/Button';
import { runRegexInWorker, type RegexRunnerResult, type RegexTestCase } from '../../engine/regexRunner';
import { Check, X } from 'lucide-react';
import { cn } from '../../lib/cn';

export default function RegexSolver({
  challenge,
  onSubmit,
  isPractice,
  attemptsLeft,
  draft,
  onSaveDraft,
  lastFeedback,
}: SolverProps) {
  const config = challenge.config;
  if (config.type !== 'regex') return null;

  const defaultDraft = (draft as { pattern: string; flags: string }) || { pattern: '', flags: '' };
  const [pattern, setPattern] = useState(defaultDraft.pattern);
  const [flags, setFlags] = useState(defaultDraft.flags);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [liveResult, setLiveResult] = useState<RegexRunnerResult | null>(null);

  const draftTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (draftTimer.current !== undefined) clearTimeout(draftTimer.current);
    draftTimer.current = window.setTimeout(() => {
      onSaveDraft({ pattern, flags });
    }, 500);
    return () => {
      if (draftTimer.current !== undefined) clearTimeout(draftTimer.current);
    };
  }, [pattern, flags, onSaveDraft]);

  const liveRunnerTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (liveRunnerTimer.current !== undefined) clearTimeout(liveRunnerTimer.current);
    liveRunnerTimer.current = window.setTimeout(async () => {
      if (!pattern) {
        setLiveResult(null);
        return;
      }
      const tests: RegexTestCase[] = [
        ...config.shouldMatch.map(str => ({ str, shouldMatch: true })),
        ...config.shouldReject.map(str => ({ str, shouldMatch: false }))
      ];
      const result = await runRegexInWorker(pattern, flags, tests);
      setLiveResult(result);
    }, 300);
    
    return () => {
      if (liveRunnerTimer.current !== undefined) clearTimeout(liveRunnerTimer.current);
    };
  }, [pattern, flags, config.shouldMatch, config.shouldReject]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit({ pattern, flags });
    setIsSubmitting(false);
  };

  const noAttempts = attemptsLeft !== null && attemptsLeft <= 0;
  const invalidRegex = liveResult?.error != null;
  const disableSubmit = isSubmitting || (noAttempts && !isPractice) || invalidRegex || !pattern;

  const renderList = (strings: string[], shouldMatch: boolean) => {
    return (
      <div className="flex flex-col gap-2">
        <h4 className="font-semibold text-sm text-muted">
          Should {shouldMatch ? 'match' : 'NOT match'}
        </h4>
        <ul className="space-y-1">
          {strings.map((str, i) => {
            const rowResult = liveResult?.results?.find(r => r.str === str);
            const passed = rowResult ? rowResult.ok : false;
            
            return (
              <li key={i} className="flex items-center gap-2 font-mono text-sm bg-panel p-2 rounded border border-border">
                {rowResult ? (
                  passed ? <Check className="w-4 h-4 text-success shrink-0" /> : <X className="w-4 h-4 text-danger shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-border shrink-0" />
                )}
                <span className={cn("truncate", rowResult && !passed && "text-danger")}>{str}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {config.brief && <p className="text-sm text-text">{config.brief}</p>}
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-muted text-lg">/</span>
          <input
            type="text"
            className="flex-1 bg-panel border border-border rounded p-2 font-mono text-text outline-none focus:border-text transition-colors"
            placeholder="pattern"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
          />
          <span className="font-mono text-muted text-lg">/</span>
          <input
            type="text"
            className="w-16 bg-panel border border-border rounded p-2 font-mono text-text outline-none focus:border-text transition-colors"
            placeholder="flags"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
          />
        </div>
        {invalidRegex && (
          <div className="text-danger text-sm font-mono mt-1">
            Error: {liveResult.error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderList(config.shouldMatch, true)}
        {renderList(config.shouldReject, false)}
      </div>

      <div className="flex justify-end gap-3">
        <Button onClick={handleSubmit} disabled={disableSubmit}>
          {isSubmitting ? 'Submitting...' : noAttempts && !isPractice ? 'No attempts left' : 'Submit'}
        </Button>
      </div>

      {lastFeedback && lastFeedback.length > 0 && (
        <div className="p-4 border border-border rounded bg-panel">
          <ul className="space-y-1 font-mono text-sm">
            {lastFeedback.map((f, i) => (
              <li key={i} className={f.includes('failed') || f.includes('Error') ? 'text-danger' : 'text-success'}>
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
