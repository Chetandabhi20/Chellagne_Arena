import { describe, it, expect } from 'vitest';
import { getLevel, getNextLevel, xpToNextLevel, getTier, dailyXp, streak, computeRankings } from '../xp';
import { dateKey, startOfToday } from '../time';
import type { DailyResult, Participant } from '../../types';

describe('XP Levels', () => {
  it('getLevel returns correct levels', () => {
    expect(getLevel(0).name).toBe('Contributor');
    expect(getLevel(100).name).toBe('Contributor');
    expect(getLevel(299).name).toBe('Contributor');
    
    expect(getLevel(300).name).toBe('Committer');
    expect(getLevel(500).name).toBe('Committer');
    expect(getLevel(699).name).toBe('Committer');
    
    expect(getLevel(700).name).toBe('Reviewer');
    expect(getLevel(1000).name).toBe('Reviewer');
    
    expect(getLevel(1300).name).toBe('Maintainer');
    expect(getLevel(2199).name).toBe('Maintainer');
    
    expect(getLevel(2200).name).toBe('Core');
    expect(getLevel(5000).name).toBe('Core');
  });

  it('getNextLevel returns next level or null if at max', () => {
    expect(getNextLevel(0)?.name).toBe('Committer');
    expect(getNextLevel(300)?.name).toBe('Reviewer');
    expect(getNextLevel(2200)).toBeNull();
  });

  it('xpToNextLevel returns correct gap', () => {
    expect(xpToNextLevel(0)).toBe(300);
    expect(xpToNextLevel(250)).toBe(50);
    expect(xpToNextLevel(2200)).toBe(0);
  });
});

describe('League Tiers', () => {
  it('getTier returns correct tiers', () => {
    expect(getTier(0)).toBe('Bronze');
    expect(getTier(399)).toBe('Bronze');
    expect(getTier(400)).toBe('Silver');
    expect(getTier(899)).toBe('Silver');
    expect(getTier(900)).toBe('Gold');
    expect(getTier(5000)).toBe('Gold');
  });
});

describe('XP calculation', () => {
  it('dailyXp calculates correctly', () => {
    const results: DailyResult[] = [
      { dateKey: '2023-01-01', answers: [], correct: 2, total: 3 }, // +20
      { dateKey: '2023-01-02', answers: [], correct: 3, total: 3 }, // +30 (perfect)
    ];
    expect(dailyXp(results)).toBe(50);
  });
});

describe('Streak', () => {
  const today = startOfToday();
  const d = (offset: number) => dateKey(today + offset * 86_400_000);

  it('returns 0 for no active days', () => {
    expect(streak(new Set(), today)).toBe(0);
  });

  it('returns 1 if only today is active', () => {
    expect(streak(new Set([d(0)]), today)).toBe(1);
  });

  it('returns 1 if today is inactive but yesterday active', () => {
    expect(streak(new Set([d(-1)]), today)).toBe(1);
  });

  it('returns 0 if today and yesterday are inactive', () => {
    expect(streak(new Set([d(-2)]), today)).toBe(0);
  });

  it('returns 3 for 3 consecutive days ending today', () => {
    expect(streak(new Set([d(0), d(-1), d(-2)]), today)).toBe(3);
  });

  it('returns 3 for 3 consecutive days ending yesterday', () => {
    expect(streak(new Set([d(-1), d(-2), d(-3)]), today)).toBe(3);
  });
});

describe('Rankings', () => {
  it('sorts by XP descending, then name ascending', () => {
    const participants: Participant[] = [
      { id: '1', name: 'Zack', branch: 'CE', year: 1, allTimeXp: 100, weeklyXp: 0, streak: 0 },
      { id: '2', name: 'Alice', branch: 'CE', year: 1, allTimeXp: 200, weeklyXp: 0, streak: 0 },
      { id: '3', name: 'Bob', branch: 'CE', year: 1, allTimeXp: 200, weeklyXp: 0, streak: 0 },
    ];
    
    const you = { id: '4', name: 'You', xp: 50, weeklyXp: 0, streak: 0, branch: 'CE', year: 1 };
    
    const rankings = computeRankings(participants, you);
    
    expect(rankings[0].name).toBe('Alice'); // 200 XP
    expect(rankings[1].name).toBe('Bob');   // 200 XP
    expect(rankings[2].name).toBe('Zack');  // 100 XP
    expect(rankings[3].name).toBe('You');   // 50 XP
    
    expect(rankings[0].rank).toBe(1);
    expect(rankings[1].rank).toBe(2);
    expect(rankings[3].rank).toBe(4);
  });
});
