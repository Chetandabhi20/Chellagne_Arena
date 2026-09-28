import { describe, it, expect } from 'vitest';
import { challengeStatus, prState, attemptsLeft, dailyPick } from '../selectors';
import type { Challenge, Submission, QuizQuestion } from '../../types';

const makeChallenge = (
  overrides: Partial<Challenge> & { opensAt: string; closesAt: string; type: Challenge['type'] }
): Challenge =>
  ({
    id: 'test-challenge',
    slug: 'test-challenge',
    title: 'Test',
    tagline: 'test',
    category: 'algorithms',
    difficulty: 'easy',
    points: 100,
    maxAttempts: 5,
    description: '',
    requirements: [],
    rules: [],
    tags: [],
    author: 'test',
    config: { type: overrides.type },
    ...overrides,
  } as unknown as Challenge);

const makeSubmission = (overrides: Partial<Submission>): Submission => ({
  id: 'sub-1',
  challengeId: 'test-challenge',
  prNumber: 101,
  openedAt: Date.now(),
  payload: null,
  result: { passed: true, scoreFraction: 1, feedback: [] },
  awardedXp: 100,
  ...overrides,
});

describe('challengeStatus', () => {
  it('returns upcoming when now is before opensAt', () => {
    const c = makeChallenge({ opensAt: new Date(2000).toISOString(), closesAt: new Date(4000).toISOString(), type: 'code' });
    expect(challengeStatus(c, 1000)).toBe('upcoming');
  });

  it('returns active when now is between opensAt and closesAt', () => {
    const c = makeChallenge({ opensAt: new Date(2000).toISOString(), closesAt: new Date(4000).toISOString(), type: 'code' });
    expect(challengeStatus(c, 3000)).toBe('active');
  });

  it('returns completed when now is after closesAt', () => {
    const c = makeChallenge({ opensAt: new Date(2000).toISOString(), closesAt: new Date(4000).toISOString(), type: 'code' });
    expect(challengeStatus(c, 5000)).toBe('completed');
  });

  it('handles exact boundaries', () => {
    const c = makeChallenge({ opensAt: new Date(2000).toISOString(), closesAt: new Date(4000).toISOString(), type: 'code' });
    expect(challengeStatus(c, 2000)).toBe('active'); // at opensAt is active
    expect(challengeStatus(c, 4000)).toBe('active'); // at closesAt is active
  });
});

describe('prState timing for auto-judged types', () => {
  it('returns open for < 2s', () => {
    const sub = makeSubmission({ openedAt: 1000 });
    expect(prState(sub, 'code', 2999)).toBe('open');
  });

  it('returns in-review for 2s to 5s', () => {
    const sub = makeSubmission({ openedAt: 1000 });
    expect(prState(sub, 'code', 3000)).toBe('in-review');
    expect(prState(sub, 'code', 5999)).toBe('in-review');
  });

  it('returns merged for >= 5s', () => {
    const sub = makeSubmission({ openedAt: 1000 });
    expect(prState(sub, 'code', 6000)).toBe('merged');
  });

  it('returns null if submission failed', () => {
    const sub = makeSubmission({ openedAt: 1000, result: { passed: false, scoreFraction: 0, feedback: [] } });
    expect(prState(sub, 'code', 6000)).toBeNull();
  });

  it('returns null if practice submission', () => {
    const sub = makeSubmission({ openedAt: 1000, practice: true });
    expect(prState(sub, 'code', 6000)).toBeNull();
  });
});

describe('prState timing for link submissions', () => {
  it('returns open for < 3s', () => {
    const sub = makeSubmission({ openedAt: 1000 });
    expect(prState(sub, 'link', 3999)).toBe('open');
  });

  it('returns in-review for >= 3s without approval', () => {
    const sub = makeSubmission({ openedAt: 1000 });
    expect(prState(sub, 'link', 4000)).toBe('in-review');
    expect(prState(sub, 'link', 20000, false)).toBe('in-review'); // demoAutoMerge false
  });

  it('returns merged if approvedAt is set', () => {
    const sub = makeSubmission({ openedAt: 1000, approvedAt: 2000 });
    expect(prState(sub, 'link', 1500)).toBe('merged'); // approved overrides time
  });

  it('returns merged if demoAutoMerge is true and elapsed >= 20s', () => {
    const sub = makeSubmission({ openedAt: 1000 });
    expect(prState(sub, 'link', 21000, true)).toBe('merged');
  });
});

describe('attemptsLeft', () => {
  it('returns null for unlimited attempts', () => {
    expect(attemptsLeft(null, 5)).toBeNull();
  });

  it('returns remaining attempts', () => {
    expect(attemptsLeft(5, 2)).toBe(3);
  });

  it('clamps at 0', () => {
    expect(attemptsLeft(2, 5)).toBe(0);
  });
});

describe('dailyPick', () => {
  const pool = Array.from({ length: 10 }, (_, i) => ({ id: `q${i}` } as QuizQuestion));

  it('returns exactly 3 questions', () => {
    const res = dailyPick(pool);
    expect(res.questions.length).toBe(3);
  });

  it('wraps around the pool correctly', () => {
    // We mock startOfToday behavior implicitly by modifying the date internally or spying,
    // but without spying, we can just test the wrapping logic of the function.
    // If the index happens to be 9, it should wrap to 0, 1.
    // Since we don't mock Date in this test without setup, we just test it doesn't crash
    // and returns 3 distinct items in order.
    const res = dailyPick(pool);
    expect(res.questions.length).toBe(3);
    const i1 = pool.indexOf(res.questions[0]);
    const i2 = pool.indexOf(res.questions[1]);
    const i3 = pool.indexOf(res.questions[2]);
    expect(i2).toBe((i1 + 1) % pool.length);
    expect(i3).toBe((i1 + 2) % pool.length);
  });
});
