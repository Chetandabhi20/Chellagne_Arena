import { describe, it, expect } from 'vitest';
import { getNextAction } from '../nextAction';
import type { Challenge, Submission, QuizQuestion, DailyResult } from '../../types';
import type { AppState } from '../../store/useStore';

const now = 1000000000000;
const h = (hours: number) => now + hours * 3600000;

const makeChallenge = (id: string, diff: string, opensAt: number, closesAt: number): Challenge => ({
  id, slug: id, title: id, difficulty: diff, points: 100, type: 'code',
  opensAt: new Date(opensAt).toISOString(),
  closesAt: new Date(closesAt).toISOString(),
  maxAttempts: 5,
} as unknown as Challenge);

const makeParams = (overrides: Partial<Parameters<typeof getNextAction>[0]>) => ({
  challenges: [],
  submissions: [],
  checkouts: {},
  dailyResults: [] as DailyResult[],
  participants: [],
  dailyPool: [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }] as QuizQuestion[],
  seedHeatmapOffsets: [-1, -2],
  profile: { name: 'You', id: '24CE000', branch: 'CE', year: 3 } as AppState['profile'],
  demoAutoMerge: true,
  now,
  ...overrides,
});

describe('getNextAction', () => {
  it('Rule 1: No merged PR and no checkout -> first-challenge', () => {
    const challenges = [
      makeChallenge('c1', 'hard', h(-10), h(100)),
      makeChallenge('c2', 'easy', h(-10), h(100)), // easiest
    ];
    const action = getNextAction(makeParams({ challenges }));
    expect(action.id).toBe('first-challenge');
    expect(action.to).toBe('/challenges/c2');
  });

  it('Rule 2: Checked-out active challenge with no pass -> resume', () => {
    const challenges = [
      makeChallenge('c1', 'easy', h(-10), h(10)),
      makeChallenge('c2', 'easy', h(-10), h(5)), // closes sooner
    ];
    const checkouts = { c1: { at: 0, attemptsUsed: 1 }, c2: { at: 0, attemptsUsed: 2 } };
    
    // Create a dummy merged PR so we skip Rule 1
    const submissions = [{ challengeId: 'dummy', result: { passed: true }, openedAt: 0, awardedXp: 100 } as Submission];
    const challengesWithDummy = [...challenges, makeChallenge('dummy', 'easy', h(-10), h(100))];
    
    const action = getNextAction(makeParams({ challenges: challengesWithDummy, checkouts, submissions }));
    expect(action.id).toBe('resume-challenge');
    expect(action.to).toBe('/challenges/c2');
  });

  it('Rule 3: Closing within 48h -> closing-soon', () => {
    const challenges = [
      makeChallenge('c1', 'easy', h(-10), h(24)), // < 48h
    ];
    const submissions = [{ challengeId: 'dummy', result: { passed: true }, openedAt: 0, awardedXp: 100 } as Submission];
    const challengesWithDummy = [...challenges, makeChallenge('dummy', 'easy', h(-10), h(100))];
    
    const action = getNextAction(makeParams({ challenges: challengesWithDummy, submissions }));
    expect(action.id).toBe('closing-soon');
    expect(action.to).toBe('/challenges/c1');
  });

  it('Rule 8: Fallback -> all-caught-up', () => {
    const action = getNextAction(makeParams({
      challenges: [makeChallenge('dummy', 'easy', h(-10), h(100))],
      submissions: [{ challengeId: 'dummy', result: { passed: true }, openedAt: 0, awardedXp: 100 } as Submission],
      dailyResults: [{ dateKey: new Date(now).toISOString().split('T')[0] } as DailyResult], // mock daily done
    }));
    // gap > 100, daily done, no open PRs -> fallback
    expect(action.id).toBe('all-caught-up');
  });
});
