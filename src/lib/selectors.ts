import type {
  Challenge,
  ChallengeStatus,
  PRState,
  Submission,
} from '../types';

// ── Challenge status (Section 7.1) ─────────────────────────────────

/**
 * Derives challenge status from its open/close timestamps.
 * NEVER store this — always compute it.
 */
export function challengeStatus(
  challenge: Challenge,
  now: number = Date.now()
): ChallengeStatus {
  const opensAt = new Date(challenge.opensAt).getTime();
  const closesAt = new Date(challenge.closesAt).getTime();
  if (now < opensAt) return 'upcoming';
  if (now > closesAt) return 'completed';
  return 'active';
}

// ── PR state (Section 7.2) ──────────────────────────────────────────

/**
 * Derives PR state from a passing, non-practice submission.
 * Returns null if the submission is failed, practice, or doesn't qualify.
 *
 * Auto-judged types (code, quiz, regex, frontend, git-terminal):
 *   < 2s → open, 2–5s → in-review, ≥ 5s → merged
 *
 * Link type:
 *   < 3s → open, then in-review until merged.
 *   Merged when approvedAt is set, OR demoAutoMerge is true and elapsed ≥ 20s.
 */
export function prState(
  submission: Submission,
  challengeType: Challenge['type'],
  now: number = Date.now(),
  demoAutoMerge: boolean = true
): PRState | null {
  if (!submission.result.passed || submission.practice) return null;

  const elapsed = now - submission.openedAt;

  if (challengeType === 'link') {
    if (submission.approvedAt != null) return 'merged';
    if (elapsed < 3_000) return 'open';
    if (demoAutoMerge && elapsed >= 20_000) return 'merged';
    return 'in-review';
  }

  // Auto-judged types
  if (elapsed < 2_000) return 'open';
  if (elapsed < 5_000) return 'in-review';
  return 'merged';
}

// ── Attempts (Section 7.9) ──────────────────────────────────────────

/**
 * Returns remaining attempts, or null if unlimited.
 */
export function attemptsLeft(
  maxAttempts: number | null,
  attemptsUsed: number
): number | null {
  if (maxAttempts === null) return null;
  return Math.max(0, maxAttempts - attemptsUsed);
}

// ── Best submission per challenge ───────────────────────────────────

/**
 * Returns the best passing non-practice submission for a challenge,
 * or undefined if none.
 */
export function bestSubmission(
  submissions: Submission[],
  challengeId: string
): Submission | undefined {
  return submissions
    .filter((s) => s.challengeId === challengeId && s.result.passed && !s.practice)
    .sort((a, b) => b.awardedXp - a.awardedXp)[0];
}

/**
 * Returns all non-practice submissions for a challenge.
 */
export function challengeSubmissions(
  submissions: Submission[],
  challengeId: string
): Submission[] {
  return submissions.filter(
    (s) => s.challengeId === challengeId && !s.practice
  );
}

/**
 * Checks if a challenge has a merged PR from the user.
 */
export function isMerged(
  submissions: Submission[],
  challengeId: string,
  challengeType: Challenge['type'],
  now: number = Date.now(),
  demoAutoMerge: boolean = true
): boolean {
  const best = bestSubmission(submissions, challengeId);
  if (!best) return false;
  return prState(best, challengeType, now, demoAutoMerge) === 'merged';
}

// ── Daily Commit pick (Section 7.8) ─────────────────────────────────

import { startOfToday } from './time';
import type { QuizQuestion } from '../types';

/**
 * Deterministic daily pick: 3 questions from the pool.
 * dayNumber = floor(startOfToday() / 86400000)
 * index = dayNumber % pool.length, take 3 consecutive (wrapping).
 */
export function dailyPick(pool: QuizQuestion[]): {
  dayNumber: number;
  puzzleNumber: number;
  questions: QuizQuestion[];
} {
  const dayNumber = Math.floor(startOfToday() / 86_400_000);
  const puzzleNumber = dayNumber - 20_000;
  const start = dayNumber % pool.length;
  const questions: QuizQuestion[] = [];
  for (let i = 0; i < 3; i++) {
    questions.push(pool[(start + i) % pool.length]);
  }
  return { dayNumber, puzzleNumber, questions };
}
