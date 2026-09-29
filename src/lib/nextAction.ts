import type { Challenge, Submission, DailyResult } from '../types';
import {
  challengeStatus,
  prState,
  bestSubmission,
} from './selectors';
import {
  earnedXp,
  xpGapToNextRank,
  computeRankings,
  streak as computeStreak,
  activeDays,
} from './xp';
import { formatRelative, dateKey } from './time';
import type { Participant, QuizQuestion } from '../types';
import type { AppState } from '../store/useStore';

// ── Next Action types ───────────────────────────────────────────────

export interface NextAction {
  id: string;
  icon: string;       // lucide icon name
  title: string;
  detail?: string;
  ctaLabel: string;
  to: string;          // route path
}

// ── Helper: check if daily is done today ────────────────────────────

function isDailyDoneToday(dailyResults: DailyResult[], now: number): boolean {
  const today = dateKey(now);
  return dailyResults.some((r) => r.dateKey === today);
}

// ── The 8 prioritized rules (Section 7.6) ───────────────────────────

export function getNextAction(params: {
  challenges: Challenge[];
  submissions: Submission[];
  checkouts: Record<string, { at: number; attemptsUsed: number }>;
  dailyResults: DailyResult[];
  participants: Participant[];
  dailyPool: QuizQuestion[];
  seedHeatmapOffsets: number[];
  profile: AppState['profile'];
  demoAutoMerge: boolean;
  now?: number;
  excludeChallengeId?: string;  // for challenge-page override
}): NextAction {
  const {
    challenges,
    submissions,
    checkouts,
    dailyResults,
    participants,
    // @ts-expect-error unused param that is part of the API
  _dailyPool,
    seedHeatmapOffsets,
    profile,
    demoAutoMerge,
    now = Date.now(),
    excludeChallengeId,
  } = params;

  const activeChallenges = challenges
    .filter((c) => challengeStatus(c, now) === 'active')
    .filter((c) => c.id !== excludeChallengeId);

  // Check if user has any merged PR
  const hasMergedPR = submissions.some((s) => {
    if (!s.result.passed || s.practice) return false;
    const ch = challenges.find((c) => c.id === s.challengeId);
    if (!ch) return false;
    return prState(s, ch.type, now, demoAutoMerge) === 'merged';
  });

  const hasCheckout = Object.keys(checkouts).length > 0;

  // Rule 1: No merged PR and no checkout exists
  if (!hasMergedPR && !hasCheckout) {
    const easiest = [...activeChallenges]
      .sort((a, b) => {
        const dOrder = { easy: 0, medium: 1, hard: 2 };
        return dOrder[a.difficulty] - dOrder[b.difficulty] || a.points - b.points;
      })[0];

    if (easiest) {
      return {
        id: 'first-challenge',
        icon: 'rocket',
        title: `Start your first challenge: ${easiest.title}, ${easiest.difficulty} · +${easiest.points} XP`,
        ctaLabel: 'Check out',
        to: `/challenges/${easiest.slug}`,
      };
    }
  }

  // Rule 2: A checked-out active challenge has no passing submission (soonest closing)
  const checkedOutActive = activeChallenges
    .filter((c) => checkouts[c.id] != null)
    .filter((c) => !bestSubmission(submissions, c.id))
    .sort((a, b) => new Date(a.closesAt).getTime() - new Date(b.closesAt).getTime());

  if (checkedOutActive.length > 0) {
    const c = checkedOutActive[0];
    const checkout = checkouts[c.id];
    const maxAtt = c.maxAttempts;
    const used = checkout.attemptsUsed;

    let detail: string;
    if (maxAtt === null) {
      detail = `Resume ${c.slug}: closes ${formatRelative(new Date(c.closesAt).getTime(), now)}`;
    } else {
      const left = maxAtt - used;
      detail = `Resume ${c.slug}: ${left} attempt${left !== 1 ? 's' : ''} left`;
    }

    return {
      id: 'resume-challenge',
      icon: 'play',
      title: detail,
      ctaLabel: 'Resume',
      to: `/challenges/${c.slug}`,
    };
  }

  // Rule 3: Any active, unsolved challenge closes within 48h (soonest)
  const closingSoon = activeChallenges
    .filter((c) => !bestSubmission(submissions, c.id))
    .filter((c) => new Date(c.closesAt).getTime() - now < 48 * 3_600_000)
    .sort((a, b) => new Date(a.closesAt).getTime() - new Date(b.closesAt).getTime());

  if (closingSoon.length > 0) {
    const c = closingSoon[0];
    const closesDate = new Date(c.closesAt);
    const weekday = closesDate.toLocaleDateString('en-US', { weekday: 'long' });

    return {
      id: 'closing-soon',
      icon: 'clock',
      title: `Submit by ${weekday}: ${c.title}, +${c.points} XP`,
      ctaLabel: 'Open',
      to: `/challenges/${c.slug}`,
    };
  }

  // Rule 4: Daily Commit not done today
  if (!isDailyDoneToday(dailyResults, now)) {
    const days = activeDays(submissions, challenges, dailyResults, seedHeatmapOffsets, now, demoAutoMerge);
    const currentStreak = computeStreak(days);

    const streakText = currentStreak > 0
      ? `Keep your ${currentStreak}-day streak: today's Daily Commit, +20 XP`
      : `Start a streak: today's Daily Commit, +20 XP`;

    return {
      id: 'daily-commit',
      icon: 'flame',
      title: streakText,
      ctaLabel: 'Play',
      to: '/daily',
    };
  }

  // Rule 5: XP gap to the next rank up is ≤ 100
  const totalXp = earnedXp(submissions, challenges, dailyResults, now, demoAutoMerge);
  const days = activeDays(submissions, challenges, dailyResults, seedHeatmapOffsets, now, demoAutoMerge);
  const currentStreak = computeStreak(days);

  const rankings = computeRankings(participants, {
    id: profile.id,
    name: profile.name,
    xp: totalXp,
    weeklyXp: 0, // not needed for ranking
    streak: currentStreak,
    branch: profile.branch,
    year: profile.year,
  });

  const gap = xpGapToNextRank(rankings);
  const you = rankings.find((r) => r.isYou);

  if (gap <= 100 && you && you.rank > 1) {
    return {
      id: 'rank-up',
      icon: 'trending-up',
      title: `You're ${gap} XP from rank ${you.rank - 1}`,
      ctaLabel: 'Find XP',
      to: '/?status=active&sort=points',
    };
  }

  // Rule 6: A PR is open or in review
  for (const s of submissions) {
    if (!s.result.passed || s.practice) continue;
    const ch = challenges.find((c) => c.id === s.challengeId);
    if (!ch || ch.id === excludeChallengeId) continue;

    const state = prState(s, ch.type, now, demoAutoMerge);
    if (state === 'open' || state === 'in-review') {
      return {
        id: 'pr-pending',
        icon: 'git-pull-request',
        title: `PR #${s.prNumber} for ${ch.slug} is ${state}`,
        ctaLabel: 'View',
        to: `/challenges/${ch.slug}`,
      };
    }
  }

  // Rule 7: An upcoming challenge exists
  const upcoming = challenges
    .filter((c) => challengeStatus(c, now) === 'upcoming' && c.id !== excludeChallengeId)
    .sort((a, b) => new Date(a.opensAt).getTime() - new Date(b.opensAt).getTime());

  if (upcoming.length > 0) {
    const c = upcoming[0];
    return {
      id: 'upcoming',
      icon: 'calendar',
      title: `Next unlock: ${c.title} ${formatRelative(new Date(c.opensAt).getTime(), now)}`,
      ctaLabel: 'Preview',
      to: `/challenges/${c.slug}`,
    };
  }

  // Rule 8: Fallback
  return {
    id: 'all-caught-up',
    icon: 'check-circle',
    title: "You're all caught up. Check the League.",
    ctaLabel: 'League',
    to: '/leaderboard',
  };
}
