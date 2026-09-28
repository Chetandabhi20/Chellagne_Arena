import type { Submission, Participant, Challenge } from '../types';
import { YOU_BASE_XP } from '../data/participants';
import { prState } from './selectors';
import { startOfToday, dateKey } from './time';
import type { DailyResult } from '../types';

// ── Level definitions (Section 7.3) ─────────────────────────────────

export interface Level {
  name: string;
  minXp: number;
}

export const LEVELS: Level[] = [
  { name: 'Contributor', minXp: 0 },
  { name: 'Committer', minXp: 300 },
  { name: 'Reviewer', minXp: 700 },
  { name: 'Maintainer', minXp: 1300 },
  { name: 'Core', minXp: 2200 },
];

/**
 * Returns the current level for a given XP total.
 */
export function getLevel(xp: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) return LEVELS[i];
  }
  return LEVELS[0];
}

/**
 * Returns the next level (or null if at max).
 */
export function getNextLevel(xp: number): Level | null {
  const current = getLevel(xp);
  const idx = LEVELS.indexOf(current);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}

/**
 * Returns XP needed to reach the next level, or 0 if at max.
 */
export function xpToNextLevel(xp: number): number {
  const next = getNextLevel(xp);
  return next ? next.minXp - xp : 0;
}

/**
 * Returns progress fraction [0, 1] toward the next level.
 */
export function levelProgress(xp: number): number {
  const current = getLevel(xp);
  const next = getNextLevel(xp);
  if (!next) return 1;
  const range = next.minXp - current.minXp;
  return (xp - current.minXp) / range;
}

// ── League tiers (Section 7.3) ──────────────────────────────────────

export type Tier = 'Bronze' | 'Silver' | 'Gold';

export function getTier(xp: number): Tier {
  if (xp >= 900) return 'Gold';
  if (xp >= 400) return 'Silver';
  return 'Bronze';
}

// ── XP calculation (Section 7.3) ────────────────────────────────────

/**
 * Computes the max awarded XP per challenge from merged, non-practice submissions.
 * Only counts submissions whose PR state is 'merged'.
 */
export function mergedXpPerChallenge(
  submissions: Submission[],
  challenges: Challenge[],
  now: number = Date.now(),
  demoAutoMerge: boolean = true
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const s of submissions) {
    if (!s.result.passed || s.practice) continue;

    const challenge = challenges.find((c) => c.id === s.challengeId);
    if (!challenge) continue;

    const state = prState(s, challenge.type, now, demoAutoMerge);
    if (state !== 'merged') continue;

    const prev = result[s.challengeId] ?? 0;
    result[s.challengeId] = Math.max(prev, s.awardedXp);
  }

  return result;
}

/**
 * Daily Commit XP: 20 per completed daily, +10 bonus for a perfect score.
 */
export function dailyXp(dailyResults: DailyResult[]): number {
  let total = 0;
  for (const r of dailyResults) {
    total += 20;
    if (r.correct === r.total) total += 10;
  }
  return total;
}

/**
 * Total earned XP for the current user.
 * = YOU_BASE_XP + sum of max merged XP per challenge + daily XP
 */
export function earnedXp(
  submissions: Submission[],
  challenges: Challenge[],
  dailyResults: DailyResult[],
  now: number = Date.now(),
  demoAutoMerge: boolean = true
): number {
  const merged = mergedXpPerChallenge(submissions, challenges, now, demoAutoMerge);
  const mergedTotal = Object.values(merged).reduce((a, b) => a + b, 0);
  return YOU_BASE_XP + mergedTotal + dailyXp(dailyResults);
}

/**
 * Weekly XP for the user: XP from merged PRs and dailies within the last 7 days.
 */
export function weeklyXp(
  submissions: Submission[],
  challenges: Challenge[],
  dailyResults: DailyResult[],
  now: number = Date.now(),
  demoAutoMerge: boolean = true
): number {
  const weekAgo = now - 7 * 86_400_000;

  let total = 0;

  // Merged submissions within last 7 days
  for (const s of submissions) {
    if (!s.result.passed || s.practice) continue;
    if (s.openedAt < weekAgo) continue;

    const challenge = challenges.find((c) => c.id === s.challengeId);
    if (!challenge) continue;

    const state = prState(s, challenge.type, now, demoAutoMerge);
    if (state !== 'merged') continue;

    total += s.awardedXp;
  }

  // Daily results within last 7 days
  const todayKey = dateKey(now);
  const weekAgoKey = dateKey(weekAgo);
  for (const r of dailyResults) {
    if (r.dateKey >= weekAgoKey && r.dateKey <= todayKey) {
      total += 20;
      if (r.correct === r.total) total += 10;
    }
  }

  return total;
}

// ── Streak and heatmap (Section 7.4) ────────────────────────────────

/**
 * Computes the set of active date keys for the user.
 * A day is active if: at least one merged PR on that date, or one Daily Commit completed.
 */
export function activeDays(
  submissions: Submission[],
  challenges: Challenge[],
  dailyResults: DailyResult[],
  seedHeatmapOffsets: number[],
  now: number = Date.now(),
  demoAutoMerge: boolean = true
): Set<string> {
  const days = new Set<string>();

  // Seed heatmap days
  const todayMs = startOfToday();
  for (const offset of seedHeatmapOffsets) {
    days.add(dateKey(todayMs + offset * 86_400_000));
  }

  // Merged submissions
  for (const s of submissions) {
    if (!s.result.passed || s.practice) continue;
    const challenge = challenges.find((c) => c.id === s.challengeId);
    if (!challenge) continue;
    const state = prState(s, challenge.type, now, demoAutoMerge);
    if (state === 'merged') {
      days.add(dateKey(s.openedAt));
    }
  }

  // Daily results
  for (const r of dailyResults) {
    days.add(r.dateKey);
  }

  return days;
}

/**
 * Streak = count of consecutive active days ending today,
 * or ending yesterday if today is not yet active.
 */
export function streak(activeDaySet: Set<string>, _now: number = Date.now()): number {
  const todayMs = startOfToday();
  const todayStr = dateKey(todayMs);

  // If today is active, start counting from today
  // If today is not active, start from yesterday (streak stays alive until day ends)
  let startDayMs: number;
  if (activeDaySet.has(todayStr)) {
    startDayMs = todayMs;
  } else {
    const yesterdayMs = todayMs - 86_400_000;
    if (activeDaySet.has(dateKey(yesterdayMs))) {
      startDayMs = yesterdayMs;
    } else {
      return 0;
    }
  }

  let count = 0;
  let cursor = startDayMs;
  while (activeDaySet.has(dateKey(cursor))) {
    count++;
    cursor -= 86_400_000;
  }

  return count;
}

// ── Leaderboard ranking (Section 7.3) ───────────────────────────────

export interface RankedEntry {
  id: string;
  name: string;
  xp: number;
  weeklyXp: number;
  streak: number;
  branch: string;
  year: number;
  rank: number;
  tier: Tier;
  isYou: boolean;
}

/**
 * Computes ranked leaderboard entries. Ties broken by name ascending.
 */
export function computeRankings(
  participants: Participant[],
  youEntry: { id: string; name: string; xp: number; weeklyXp: number; streak: number; branch: string; year: number }
): RankedEntry[] {
  const entries = [
    ...participants.map((p) => ({
      id: p.id,
      name: p.name,
      xp: p.allTimeXp,
      weeklyXp: p.weeklyXp,
      streak: p.streak,
      branch: p.branch,
      year: p.year as number,
      isYou: false,
    })),
    { ...youEntry, isYou: true },
  ];

  // Sort by XP descending, then name ascending for ties
  entries.sort((a, b) => {
    if (b.xp !== a.xp) return b.xp - a.xp;
    return a.name.localeCompare(b.name);
  });

  return entries.map((e, i) => ({
    ...e,
    rank: i + 1,
    tier: getTier(e.xp),
  }));
}

/**
 * Returns the user's rank from the rankings.
 */
export function yourRank(rankings: RankedEntry[]): number {
  const you = rankings.find((r) => r.isYou);
  return you?.rank ?? rankings.length;
}

/**
 * XP gap to the next rank up.
 */
export function xpGapToNextRank(rankings: RankedEntry[]): number {
  const you = rankings.find((r) => r.isYou);
  if (!you || you.rank <= 1) return Infinity;
  const above = rankings[you.rank - 2]; // rank-2 because array is 0-indexed
  return above.xp - you.xp + 1;
}
