import { useMemo, useCallback, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePageTitle, useNow } from '../hooks';
import { useStore } from '../store/useStore';
import { challenges as seedChallenges } from '../data/challenges';
import { challengeStatus, prState, bestSubmission } from '../lib/selectors';
import { formatDeadline } from '../lib/time';
import { useChallengeSession } from '../engine/useChallengeSession';
import {
  Tag,
  StatusPill,
  DifficultyDot,
  ChallengeCover,
  Countdown,
  CountUp,
} from '../components/ui';
import { CheckoutPanel } from '../components/challenge/CheckoutPanel';
import { UpcomingPanel } from '../components/challenge/UpcomingPanel';
import { CompletedPanel } from '../components/challenge/CompletedPanel';
import { PRTimeline } from '../components/challenge/PRTimeline';
import { SolverPanel } from '../components/solvers/SolverRegistry';
import {
  GitBranch,
  Clock,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import { toast } from '../components/ui/Toast';
import type { PRState } from '../types';

// Render description paragraphs with inline code support
function renderDescription(desc: string) {
  return desc.split('\n\n').map((para, i) => {
    // Handle inline `code` spans
    const parts = para.split(/(`[^`]+`)/g);
    return (
      <p key={i} className="text-sm text-text leading-relaxed mb-3">
        {parts.map((part, j) => {
          if (part.startsWith('`') && part.endsWith('`')) {
            return (
              <code key={j} className="px-1 py-0.5 rounded bg-panel-2 text-accent font-mono text-xs">
                {part.slice(1, -1)}
              </code>
            );
          }
          return part;
        })}
      </p>
    );
  });
}

export default function ChallengeDetail() {
  const { slug } = useParams<{ slug: string }>();
  const now = useNow(1000);

  // Find challenge from seeds + custom
  const customChallenges = useStore((s) => s.customChallenges);
  const allChallenges = useMemo(
    () => [...seedChallenges, ...customChallenges],
    [customChallenges]
  );
  const challenge = useMemo(
    () => allChallenges.find((c) => c.slug === slug),
    [allChallenges, slug]
  );

  usePageTitle(challenge ? challenge.title : 'Not Found');

  if (!challenge) {
    return (
      <div className="text-center py-16">
        <p className="font-mono text-muted text-sm mb-2">
          fatal: pathspec '{slug}' did not match any challenges
        </p>
        <Link to="/" className="text-accent hover:underline text-sm font-mono">
          cd arena
        </Link>
      </div>
    );
  }

  return <ChallengeDetailInner challenge={challenge} now={now} />;
}

function ChallengeDetailInner({
  challenge,
  now,
}: {
  challenge: NonNullable<ReturnType<typeof useMemo>>;
  now: number;
}) {
  // Need to cast since the find might return undefined but we've already guarded
  const ch = challenge as import('../types').Challenge;
  const status = challengeStatus(ch, now);
  const session = useChallengeSession(ch);
  const store = useStore();
  const [lastFeedback, setLastFeedback] = useState<string[] | null>(null);
  const [lastResult, setLastResult] = useState<import('../engine/types').CheckOutput | null>(null);
  const [showMergedBanner, setShowMergedBanner] = useState(false);

  // Check if the best submission is now merged (for showing the banner)
  const bestSub = bestSubmission(store.submissions, ch.id);
  const bestPrState: PRState | null = bestSub
    ? prState(bestSub, ch.type, now, store.settings.demoAutoMerge)
    : null;

  // Watch for merged state to trigger toast and banner
  const prevPrStateRef = useMemo(() => ({ current: bestPrState }), []);
  useEffect(() => {
    if (prevPrStateRef.current !== 'merged' && bestPrState === 'merged' && bestSub) {
      setShowMergedBanner(true);
      toast({ type: 'success', message: `Merged! +${bestSub.awardedXp} XP earned` });

      // Add merged activity
      store.addActivity({
        id: `act-${Date.now()}-merged`,
        at: Date.now(),
        actor: store.profile.name,
        verb: 'merged',
        challengeSlug: ch.slug,
        xp: bestSub.awardedXp,
      });
    }
    prevPrStateRef.current = bestPrState;
  }, [bestPrState, bestSub, ch.slug, store, prevPrStateRef]);

  const handleSubmit = useCallback(async (payload: unknown) => {
    const result = await session.submit(payload);
    if (result) {
      setLastFeedback(result.feedback);
      setLastResult(result);
    }
  }, [session]);

  const handleRun = useCallback(async (payload: unknown) => {
    const result = await session.run(payload);
    if (result) {
      setLastFeedback(result.feedback);
      setLastResult(result);
    }
  }, [session]);

  // Format deadline
  const closesAt = new Date(ch.closesAt).getTime();
  const opensAt = new Date(ch.opensAt).getTime();

  // Status pill config
  const statusConfig = {
    upcoming: { label: 'upcoming', variant: 'warning' as const },
    active: { label: 'active', variant: 'success' as const },
    completed: { label: 'completed', variant: 'neutral' as const },
  }[status];

  // PR state pill config
  const prPillConfig: Record<PRState, { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
    open: { label: 'Open', variant: 'success' },
    'in-review': { label: 'In review', variant: 'warning' },
    merged: { label: 'Merged', variant: 'success' },
  };

  const remaining = session.remaining;

  const copyLink = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        toast({ type: 'info', message: 'Link copied' });
      });
    } else {
      toast({ type: 'info', message: url });
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs font-mono text-muted mb-4">
        <Link to="/" className="hover:text-text transition-colors">arena</Link>
        <span>/</span>
        <span>challenges</span>
        <span>/</span>
        <span className="text-text">{ch.slug}</span>
      </nav>

      {/* Merged banner */}
      {showMergedBanner && bestPrState === 'merged' && bestSub && (
        <div className="bg-success/10 border border-success rounded p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="font-mono text-sm text-success font-medium">Merged</span>
            <CountUp value={bestSub.awardedXp} prefix="+" suffix=" XP" />
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column: content */}
        <div className="flex-1 lg:w-3/5 min-w-0">
          {/* Cover */}
          <ChallengeCover slug={ch.slug} size="lg" />

          {/* Header */}
          <div className="mt-4">
            <h1 className="text-2xl lg:text-3xl font-mono font-bold text-text mb-2">
              {ch.title}
            </h1>
            <p className="text-sm text-muted mb-3">{ch.tagline}</p>

            {/* Tag row */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Tag label={ch.category} />
              <span className="flex items-center gap-1">
                <DifficultyDot difficulty={ch.difficulty} />
                <span className="text-xs font-mono text-muted">{ch.difficulty}</span>
              </span>
              <Tag label={ch.type} />
              <StatusPill {...statusConfig} />
              {ch.custom && <Tag label="custom" />}
            </div>

            {/* Branch chip + points + deadline */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {session.isCheckedOut && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-success bg-success/10 text-success text-xs font-mono">
                  <GitBranch className="w-3 h-3" />
                  challenge/{ch.slug}
                </span>
              )}
              <span className="font-mono font-bold text-accent">+{ch.points} XP</span>
              <span className="flex items-center gap-1 text-muted">
                <Clock className="w-3.5 h-3.5" />
                {status === 'active' && <Countdown to={closesAt} prefix="Closes in" />}
                {status === 'upcoming' && <Countdown to={opensAt} prefix="Opens in" />}
                {status === 'completed' && <span className="text-xs font-mono">Closed {formatDeadline(closesAt)}</span>}
              </span>
            </div>

            {/* Attempts left */}
            {session.isCheckedOut && remaining !== null && (
              <p className="text-xs font-mono text-muted mt-2">
                {remaining} attempt{remaining !== 1 ? 's' : ''} left
              </p>
            )}

            {/* Best PR state */}
            {bestSub && bestPrState && (
              <div className="mt-2">
                <StatusPill
                  label={prPillConfig[bestPrState].label}
                  variant={prPillConfig[bestPrState].variant}
                />
                <span className="text-xs font-mono text-muted ml-2">
                  PR #{bestSub.prNumber}
                </span>
              </div>
            )}
          </div>

          {/* Problem description */}
          <section className="mt-6">
            <h2 className="text-lg font-mono font-bold text-text mb-3">Problem</h2>
            {renderDescription(ch.description)}
          </section>

          {/* Requirements */}
          <section className="mt-4">
            <h2 className="text-lg font-mono font-bold text-text mb-3">Requirements</h2>
            <ul className="space-y-1">
              {ch.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text">
                  <CheckCircle2 className="w-4 h-4 text-muted shrink-0 mt-0.5" />
                  {req}
                </li>
              ))}
            </ul>
          </section>

          {/* Rules */}
          <section className="mt-4">
            <h2 className="text-lg font-mono font-bold text-text mb-3">Rules</h2>
            <ol className="list-decimal list-inside space-y-1">
              {ch.rules.map((rule, i) => (
                <li key={i} className="text-sm text-text">{rule}</li>
              ))}
            </ol>
          </section>

          {/* Tags */}
          <section className="mt-4">
            <h2 className="text-lg font-mono font-bold text-text mb-3">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {ch.tags.map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
            </div>
          </section>

          {/* Author + copy link */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <span className="text-xs text-muted">by {ch.author}</span>
            <button
              onClick={copyLink}
              className="flex items-center gap-1 text-xs text-muted hover:text-text transition-colors focus-ring rounded px-2 py-1"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy link
            </button>
          </div>
        </div>

        {/* Right column: solver / status */}
        <div className="lg:w-2/5 lg:sticky lg:top-28 lg:self-start space-y-4">
          {/* Solver area */}
          {status === 'upcoming' && (
            <UpcomingPanel challengeId={ch.id} opensAt={opensAt} />
          )}

          {status === 'completed' && !session.isCheckedOut && (
            <CompletedPanel
              challenge={ch}
              onPracticeCheckout={session.doCheckout}
              isCheckedOut={session.isCheckedOut}
            />
          )}

          {(status === 'active' || (status === 'completed' && session.isCheckedOut)) && (
            <>
              {!session.isCheckedOut ? (
                <CheckoutPanel
                  slug={ch.slug}
                  onCheckout={session.doCheckout}
                  isCheckedOut={session.isCheckedOut}
                />
              ) : (
                <SolverPanel
                  challenge={ch}
                  onSubmit={handleSubmit}
                  onRun={handleRun}
                  isPractice={session.isPractice}
                  attemptsLeft={session.remaining}
                  draft={session.draft}
                  onSaveDraft={session.saveDraft}
                  lastFeedback={lastFeedback}
                  lastResult={lastResult}
                />
              )}
            </>
          )}

          {/* PR Timeline */}
          {bestSub && bestPrState && (
            <PRTimeline submission={bestSub} challenge={ch} />
          )}
        </div>
      </div>
    </div>
  );
}
