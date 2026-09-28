import { describe, it, expect } from 'vitest';
import { deriveBadges } from '../badges';
import type { Submission, Challenge } from '../../types';

const makeChallenge = (id: string, type: Challenge['type'], opensAt: number): Challenge => ({
  id,
  slug: id,
  type,
  opensAt: new Date(opensAt).toISOString(),
} as unknown as Challenge);

const makeSub = (id: string, challengeId: string, openedAt: number, passed: boolean = true): Submission => ({
  id,
  challengeId,
  openedAt,
  result: { passed, scoreFraction: 1, feedback: [] },
  practice: false,
} as unknown as Submission);

describe('deriveBadges', () => {
  const now = 10000;
  
  it('returns only non-merge badges for no submissions', () => {
    const badges = deriveBadges({
      submissions: [], challenges: [], currentStreak: 3, dailyCount: 5, rank: 2, now
    });
    
    expect(badges.find(b => b.id === '3-day-streak')?.earned).toBe(true);
    expect(badges.find(b => b.id === 'daily-devotee')?.earned).toBe(true);
    expect(badges.find(b => b.id === 'top-3')?.earned).toBe(true);
    expect(badges.find(b => b.id === 'first-merge')?.earned).toBe(false);
  });

  it('awards type-specific badges and first-merge', () => {
    const challenges = [
      makeChallenge('c1', 'code', 0),
      makeChallenge('c2', 'regex', 0),
      makeChallenge('c3', 'frontend', 0),
    ];
    
    const submissions = [
      makeSub('s1', 'c1', 1000), // >5s elapsed -> merged
    ];

    const b1 = deriveBadges({ submissions, challenges, currentStreak: 0, dailyCount: 0, rank: 10, now });
    expect(b1.find(b => b.id === 'first-merge')?.earned).toBe(true);
    expect(b1.find(b => b.id === 'bug-squasher')?.earned).toBe(true);
    expect(b1.find(b => b.id === 'hat-trick')?.earned).toBe(false);
    expect(b1.find(b => b.id === 'regex-wizard')?.earned).toBe(false);
    
    const submissions3 = [
      makeSub('s1', 'c1', 1000),
      makeSub('s2', 'c2', 1000),
      makeSub('s3', 'c3', 1000),
    ];
    
    const b3 = deriveBadges({ submissions: submissions3, challenges, currentStreak: 0, dailyCount: 0, rank: 10, now });
    expect(b3.find(b => b.id === 'hat-trick')?.earned).toBe(true);
    expect(b3.find(b => b.id === 'regex-wizard')?.earned).toBe(true);
    expect(b3.find(b => b.id === 'pixel-perfect')?.earned).toBe(true);
  });
  
  it('awards early-bird if PR opened within 24h of challenge opensAt', () => {
    const c1 = makeChallenge('c1', 'code', 1000);
    // Opened at 1000 + 12h
    const s1 = makeSub('s1', 'c1', 1000 + 12 * 3600000);
    
    const badges = deriveBadges({
      submissions: [s1], challenges: [c1], currentStreak: 0, dailyCount: 0, rank: 10, now: s1.openedAt + 10000
    });
    
    expect(badges.find(b => b.id === 'early-bird')?.earned).toBe(true);
  });
});
