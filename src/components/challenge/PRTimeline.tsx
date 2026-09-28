import { useMemo } from 'react';
import { cn } from '../../lib/cn';
import { prState } from '../../lib/selectors';
import { useNow } from '../../hooks';
import { useStore } from '../../store/useStore';
import type { Submission, Challenge } from '../../types';
import type { PRState } from '../../types';
import { Circle, Loader2, CheckCircle2, Clock } from 'lucide-react';

function formatTime(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  const s = d.getSeconds().toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

interface PRTimelineProps {
  submission: Submission;
  challenge: Challenge;
}

/** Live PR timeline that advances Open → In review → Merged using useNow */
export function PRTimeline({ submission, challenge }: PRTimelineProps) {
  const now = useNow(1000);
  const demoAutoMerge = useStore((s) => s.settings.demoAutoMerge);

  const state = useMemo(
    () => prState(submission, challenge.type, now, demoAutoMerge),
    [submission, challenge.type, now, demoAutoMerge]
  );

  if (!state) return null;

  const steps: { label: string; state: PRState; icon: typeof Circle }[] = [
    { label: 'Open', state: 'open', icon: Circle },
    { label: 'In review', state: 'in-review', icon: Loader2 },
    { label: 'Merged', state: 'merged', icon: CheckCircle2 },
  ];

  const stateOrder: PRState[] = ['open', 'in-review', 'merged'];
  const currentIdx = stateOrder.indexOf(state);

  return (
    <div className="mt-4 p-4 bg-panel border border-border rounded">
      <h4 className="text-sm font-mono font-medium text-text mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4 text-muted" />
        PR #{submission.prNumber} Timeline
      </h4>

      <div className="flex items-start gap-0">
        {steps.map((step, i) => {
          const stepIdx = stateOrder.indexOf(step.state);
          const isActive = stepIdx === currentIdx;
          const isDone = stepIdx < currentIdx;
          const isFuture = stepIdx > currentIdx;
          const Icon = step.icon;

          return (
            <div key={step.state} className="flex-1 relative">
              {/* Connecting line */}
              {i > 0 && (
                <div
                  className={cn(
                    'absolute top-3 right-1/2 left-0 h-0.5 -translate-y-1/2',
                    isDone || isActive ? 'bg-success' : 'bg-border'
                  )}
                />
              )}
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    'absolute top-3 left-1/2 right-0 h-0.5 -translate-y-1/2',
                    isDone ? 'bg-success' : 'bg-border'
                  )}
                />
              )}

              {/* Node */}
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center z-10',
                    isDone && 'bg-success text-accent-fg',
                    isActive && step.state === 'open' && 'bg-success/20 text-success border-2 border-success',
                    isActive && step.state === 'in-review' && 'bg-warning/20 text-warning border-2 border-warning',
                    isActive && step.state === 'merged' && 'bg-success text-accent-fg',
                    isFuture && 'bg-panel-2 text-muted border border-border'
                  )}
                >
                  {isActive && step.state === 'in-review' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-mono mt-1',
                    isActive ? 'text-text font-medium' : 'text-muted'
                  )}
                >
                  {step.label}
                </span>
                {isDone && step.state === 'open' && (
                  <span className="text-xs text-muted font-mono">
                    {formatTime(submission.openedAt)}
                  </span>
                )}
                {isActive && step.state === 'merged' && (
                  <span className="text-xs text-success font-mono font-medium">
                    +{submission.awardedXp} XP
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {submission.result.passed && state !== 'merged' && (
        <p className="text-xs text-muted font-mono mt-3 text-center">
          Reviewing your pull request...
        </p>
      )}
    </div>
  );
}
