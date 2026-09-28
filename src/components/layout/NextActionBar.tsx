import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui';
import { useStore } from '../../store/useStore';
import { useNow } from '../../hooks';
import { getNextAction, type NextAction } from '../../lib/nextAction';
import { challenges as seedChallenges } from '../../data/challenges';
import { participants } from '../../data/participants';
import { dailyPool } from '../../data/dailyPool';
import { SEED_HEATMAP_OFFSETS } from '../../data';
import type { AppState } from '../../store/useStore';
import { challengeStatus, prState, bestSubmission, attemptsLeft as attemptsLeftFn } from '../../lib/selectors';
import { formatRelative } from '../../lib/time';
import {
  ArrowRight,
  Rocket,
  Play,
  Clock,
  Flame,
  TrendingUp,
  GitPullRequest,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

const ICON_MAP: Record<string, typeof Rocket> = {
  rocket: Rocket,
  play: Play,
  clock: Clock,
  flame: Flame,
  'trending-up': TrendingUp,
  'git-pull-request': GitPullRequest,
  calendar: Calendar,
  'check-circle': CheckCircle2,
};

/**
 * Challenge detail page contextual override per SPEC Section 7.6
 */
function getChallengeOverride(
  challengeId: string,
  slug: string,
  store: AppState,
  now: number,
  globalAction: NextAction,
): NextAction | null {
  const allChallenges = [...seedChallenges, ...store.customChallenges];
  const challenge = allChallenges.find((c) => c.id === challengeId);
  if (!challenge) return null;

  const status = challengeStatus(challenge, now);
  if (status === 'upcoming') {
    return {
      id: 'detail-upcoming',
      icon: 'calendar',
      title: `Unlocks ${formatRelative(new Date(challenge.opensAt).getTime(), now)}`,
      ctaLabel: 'Preview',
      to: `/challenges/${slug}`,
    };
  }

  const checkout = store.checkouts[challengeId];
  const best = bestSubmission(store.submissions, challengeId);

  if (!checkout && status === 'active') {
    return {
      id: 'detail-checkout',
      icon: 'rocket',
      title: 'Check out to begin',
      ctaLabel: 'Check out',
      to: `/challenges/${slug}`,
    };
  }

  if (best) {
    const state = prState(best, challenge.type, now, store.settings.demoAutoMerge);
    if (state === 'open' || state === 'in-review') {
      return {
        id: 'detail-pr',
        icon: 'git-pull-request',
        title: `PR #${best.prNumber} is ${state}`,
        ctaLabel: 'View',
        to: `/challenges/${slug}`,
      };
    }
    if (state === 'merged') {
      return {
        id: 'detail-merged',
        icon: 'check-circle',
        title: `Merged. +${best.awardedXp} XP. Next: ${globalAction.title}`,
        ctaLabel: globalAction.ctaLabel,
        to: globalAction.to,
      };
    }
  }

  if (checkout && status === 'active') {
    const remaining = attemptsLeftFn(challenge.maxAttempts, checkout.attemptsUsed);
    const closesAt = new Date(challenge.closesAt).getTime();
    const attMsg = remaining !== null
      ? `${remaining} attempt${remaining !== 1 ? 's' : ''} left`
      : `closes ${formatRelative(closesAt, now)}`;
    return {
      id: 'detail-resume',
      icon: 'play',
      title: `${slug}: ${attMsg}`,
      ctaLabel: 'Solve',
      to: `/challenges/${slug}`,
    };
  }

  return null;
}

export const NextActionBar = () => {
  const store = useStore();
  const now = useNow(30_000);
  const location = useLocation();

  // Check if we're on a challenge detail page
  const challengeMatch = location.pathname.match(/^\/challenges\/([^/]+)$/);
  const detailSlug = challengeMatch?.[1] ?? null;

  const allChallenges = useMemo(
    () => [...seedChallenges, ...store.customChallenges],
    [store.customChallenges]
  );

  // Global next action (excluding current challenge if on detail page)
  const challenge = detailSlug
    ? allChallenges.find((c) => c.slug === detailSlug)
    : null;

  const globalAction = useMemo(() => getNextAction({
    challenges: allChallenges,
    submissions: store.submissions,
    checkouts: store.checkouts,
    dailyResults: store.dailyResults,
    participants,
    dailyPool,
    seedHeatmapOffsets: SEED_HEATMAP_OFFSETS,
    profile: store.profile,
    demoAutoMerge: store.settings.demoAutoMerge,
    now,
    excludeChallengeId: challenge?.id,
  }), [allChallenges, store.submissions, store.checkouts, store.dailyResults, store.profile, store.settings.demoAutoMerge, now, challenge?.id]);

  // Detail page override
  const action = useMemo(() => {
    if (challenge) {
      const override = getChallengeOverride(
        challenge.id,
        challenge.slug,
        store,
        now,
        globalAction,
      );
      if (override) return override;
    }
    return globalAction;
  }, [challenge, store, now, globalAction]);

  const Icon = ICON_MAP[action.icon] ?? ArrowRight;

  return (
    <div className="sticky top-16 z-30 bg-panel-2 border-b border-border h-12 flex items-center px-4 sm:px-6">
      <div className="flex items-center gap-3 w-full max-w-5xl mx-auto">
        <Icon className="w-4 h-4 text-accent shrink-0" />
        <span className="font-mono text-sm truncate flex-1">{action.title}</span>
        <Link to={action.to}>
          <Button size="sm" variant="primary" className="shrink-0 hidden sm:flex gap-1">
            {action.ctaLabel} <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
