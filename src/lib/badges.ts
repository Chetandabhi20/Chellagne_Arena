import type { Challenge, Submission } from '../types';
import { prState } from './selectors';

// ── Badge definitions (Section 7.5) ─────────────────────────────────

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
}

export const BADGE_DEFS: BadgeDef[] = [
  { id: 'first-merge', name: 'First Merge', description: '≥ 1 merged PR', icon: 'git-merge' },
  { id: 'hat-trick', name: 'Hat Trick', description: '≥ 3 merged PRs', icon: 'trophy' },
  { id: 'regex-wizard', name: 'Regex Wizard', description: 'Merged a regex challenge', icon: 'regex' },
  { id: 'pixel-perfect', name: 'Pixel Perfect', description: 'Merged a frontend challenge', icon: 'palette' },
  { id: 'bug-squasher', name: 'Bug Squasher', description: 'Merged a code challenge', icon: 'bug' },
  { id: 'early-bird', name: 'Early Bird', description: 'PR opened within 24h of challenge opening', icon: 'sunrise' },
  { id: '3-day-streak', name: '3-Day Streak', description: 'streak ≥ 3', icon: 'flame' },
  { id: '7-day-streak', name: '7-Day Streak', description: 'streak ≥ 7', icon: 'flame-kindling' },
  { id: 'daily-devotee', name: 'Daily Devotee', description: '≥ 5 Daily Commits completed', icon: 'calendar-check' },
  { id: 'top-3', name: 'Top 3', description: 'Current rank ≤ 3', icon: 'medal' },
];

export interface BadgeState {
  id: string;
  earned: boolean;
}

/**
 * Derives which badges the user has earned.
 * All logic is pure — depends only on submissions, challenges, streak, dailyCount, rank.
 */
export function deriveBadges(params: {
  submissions: Submission[];
  challenges: Challenge[];
  currentStreak: number;
  dailyCount: number;
  rank: number;
  now?: number;
  demoAutoMerge?: boolean;
}): BadgeState[] {
  const {
    submissions,
    challenges,
    currentStreak,
    dailyCount,
    rank,
    now = Date.now(),
    demoAutoMerge = true,
  } = params;

  // Count merged PRs (unique challenges) and types
  const mergedChallengeIds = new Set<string>();
  const mergedTypes = new Set<string>();
  let hasEarlyBird = false;

  for (const s of submissions) {
    if (!s.result.passed || s.practice) continue;
    const challenge = challenges.find((c) => c.id === s.challengeId);
    if (!challenge) continue;

    const state = prState(s, challenge.type, now, demoAutoMerge);
    if (state !== 'merged') continue;

    mergedChallengeIds.add(s.challengeId);
    mergedTypes.add(challenge.type);

    // Early Bird: PR opened within 24h of challenge opening
    const opensAtMs = new Date(challenge.opensAt).getTime();
    if (s.openedAt - opensAtMs < 24 * 3_600_000) {
      hasEarlyBird = true;
    }
  }

  const mergedCount = mergedChallengeIds.size;

  return BADGE_DEFS.map((def) => {
    let earned = false;
    switch (def.id) {
      case 'first-merge':
        earned = mergedCount >= 1;
        break;
      case 'hat-trick':
        earned = mergedCount >= 3;
        break;
      case 'regex-wizard':
        earned = mergedTypes.has('regex');
        break;
      case 'pixel-perfect':
        earned = mergedTypes.has('frontend');
        break;
      case 'bug-squasher':
        earned = mergedTypes.has('code');
        break;
      case 'early-bird':
        earned = hasEarlyBird;
        break;
      case '3-day-streak':
        earned = currentStreak >= 3;
        break;
      case '7-day-streak':
        earned = currentStreak >= 7;
        break;
      case 'daily-devotee':
        earned = dailyCount >= 5;
        break;
      case 'top-3':
        earned = rank <= 3;
        break;
    }
    return { id: def.id, earned };
  });
}
