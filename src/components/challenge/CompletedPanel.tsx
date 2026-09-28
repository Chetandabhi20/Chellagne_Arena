import type { Challenge } from '../../types';
import { Button } from '../ui';
import { CheckCircle2 } from 'lucide-react';

interface CompletedPanelProps {
  challenge: Challenge;
  onPracticeCheckout: () => void;
  isCheckedOut: boolean;
}

/**
 * Shown for completed challenges: description is visible,
 * a "Practice mode" checkout is allowed for auto-judged types.
 * Link-type completed challenges are read-only.
 */
export function CompletedPanel({ challenge, onPracticeCheckout, isCheckedOut }: CompletedPanelProps) {
  const isLink = challenge.type === 'link';

  if (isCheckedOut) {
    return null; // Solver panel shows in practice mode
  }

  return (
    <div className="border border-border rounded bg-panel p-6 text-center">
      <div className="flex items-center justify-center gap-2 text-muted mb-3">
        <CheckCircle2 className="w-5 h-5" />
        <span className="font-mono text-sm">Challenge closed</span>
      </div>
      <p className="text-sm text-muted mb-4">
        {isLink
          ? 'This challenge has ended. Submissions are closed.'
          : 'This challenge has ended. You can still practice — results won\'t award XP or create a PR.'}
      </p>
      {!isLink && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onPracticeCheckout}
        >
          Practice mode
        </Button>
      )}
    </div>
  );
}
