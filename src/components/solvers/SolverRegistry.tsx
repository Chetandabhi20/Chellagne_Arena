import { lazy, Suspense, type ComponentType } from 'react';
import type { ChallengeType, Challenge } from '../../types';
import { Skeleton } from '../ui';

// Lazy-loaded solver panels keyed by challenge type
const QuizSolver = lazy(() => import('./QuizSolver'));
const LinkSolver = lazy(() => import('./LinkSolver'));

// Placeholder for types not yet implemented
function NotYetAvailable({ type }: { type: string }) {
  return (
    <div className="border border-border rounded bg-panel p-6 text-center">
      <p className="text-sm text-muted font-mono">
        The {type} solver is coming in a future phase.
      </p>
    </div>
  );
}

export interface SolverProps {
  challenge: Challenge;
  onSubmit: (payload: unknown) => Promise<void>;
  onRun?: (payload: unknown) => Promise<void>;
  isPractice: boolean;
  attemptsLeft: number | null;
  draft: unknown;
  onSaveDraft: (payload: unknown) => void;
  lastFeedback?: string[] | null;
}

// Registry mapping type → component
const SOLVER_COMPONENTS: Record<ChallengeType, ComponentType<SolverProps> | null> = {
  quiz: QuizSolver as unknown as ComponentType<SolverProps>,
  link: LinkSolver as unknown as ComponentType<SolverProps>,
  code: null,       // P4
  regex: null,      // P6
  frontend: null,   // P6
  'git-terminal': null, // P10 stretch
};

export function SolverPanel(props: SolverProps) {
  const SolverComponent = SOLVER_COMPONENTS[props.challenge.type];

  if (!SolverComponent) {
    return <NotYetAvailable type={props.challenge.type} />;
  }

  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <SolverComponent {...props} />
    </Suspense>
  );
}
