import { useState, useCallback } from 'react';
import type { Challenge } from '../../types';
import { Button } from '../ui';
import { cn } from '../../lib/cn';
import { ExternalLink, CheckSquare } from 'lucide-react';

interface LinkSolverProps {
  challenge: Challenge;
  onSubmit: (payload: { url: string; note: string }) => Promise<void>;
  isPractice: boolean;
  attemptsLeft: number | null;
}

export default function LinkSolver({
  challenge,
  onSubmit,
  isPractice,
  attemptsLeft,
}: LinkSolverProps) {
  const config = challenge.config;
  if (config.type !== 'link') return null;

  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [urlError, setUrlError] = useState('');

  const maxNote = 300;

  const validateUrl = useCallback((val: string) => {
    if (!val) {
      setUrlError('');
      return;
    }
    if (!val.startsWith('https://')) {
      setUrlError('URL must start with https://');
      return;
    }
    try {
      const parsed = new URL(val);
      const host = parsed.hostname.toLowerCase();

      // Check host restrictions
      if (!config.linkKinds.includes('other') && !config.linkKinds.includes('demo')) {
        const hostMap: Record<string, string> = {
          github: 'github.com',
          figma: 'figma.com',
          drive: 'drive.google.com',
        };
        const allowed = config.linkKinds
          .filter((k) => k in hostMap)
          .map((k) => hostMap[k]);

        if (allowed.length > 0 && !allowed.some((h) => host.includes(h))) {
          setUrlError(`URL must be from: ${allowed.join(', ')}`);
          return;
        }
      }
      setUrlError('');
    } catch {
      setUrlError('Invalid URL');
    }
  }, [config.linkKinds]);

  const canSubmit =
    url.startsWith('https://') &&
    !urlError &&
    note.trim().length > 0 &&
    confirmed &&
    !submitting &&
    (attemptsLeft === null || attemptsLeft > 0);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    await onSubmit({ url, note });
    setSubmitting(false);
  };

  return (
    <div className="border border-border rounded bg-panel p-4 space-y-4">
      <p className="text-sm text-muted">{config.prompt}</p>

      {/* URL field */}
      <div>
        <label htmlFor="link-url" className="block text-sm font-medium text-text mb-1">
          URL
        </label>
        <div className="relative">
          <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            id="link-url"
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              validateUrl(e.target.value);
            }}
            placeholder="https://..."
            autoCapitalize="off"
            spellCheck={false}
            className={cn(
              'w-full pl-10 pr-3 py-2 rounded border bg-bg text-text font-mono text-sm focus-ring',
              urlError ? 'border-danger' : 'border-border'
            )}
            aria-describedby={urlError ? 'url-error' : undefined}
          />
        </div>
        {urlError && (
          <p id="url-error" className="text-xs text-danger mt-1">{urlError}</p>
        )}
        {config.linkKinds.length > 0 && (
          <p className="text-xs text-muted mt-1">
            Accepted: {config.linkKinds.join(', ')}
          </p>
        )}
      </div>

      {/* Note textarea */}
      <div>
        <label htmlFor="link-note" className="block text-sm font-medium text-text mb-1">
          Note
        </label>
        <textarea
          id="link-note"
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, maxNote))}
          placeholder="A short note about your submission..."
          rows={3}
          className="w-full px-3 py-2 rounded border border-border bg-bg text-text text-sm resize-none focus-ring"
        />
        <p className="text-xs text-muted text-right">
          {note.length}/{maxNote}
        </p>
      </div>

      {/* Confirmation checkbox */}
      <label className="flex items-start gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 rounded"
        />
        <span>I confirm this is my own work</span>
      </label>

      {/* Submit button */}
      <Button
        variant="primary"
        className="w-full gap-2"
        onClick={handleSubmit}
        disabled={!canSubmit}
      >
        <CheckSquare className="w-4 h-4" />
        {attemptsLeft !== null && attemptsLeft <= 0
          ? 'No attempts left'
          : submitting
            ? 'Submitting...'
            : 'Open pull request'}
      </Button>

      {isPractice && (
        <p className="text-xs text-muted font-mono text-center">
          Practice mode — submissions are read-only for closed challenges.
        </p>
      )}
    </div>
  );
}
