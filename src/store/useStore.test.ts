import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './useStore';
import type { Challenge, Submission, ActivityEntry } from '../types';

describe('useStore actions', () => {
  beforeEach(() => {
    useStore.getState().resetDemo();
  });

  it('checkout creates checkout entry without overwriting existing one', () => {
    const { checkout } = useStore.getState();
    checkout('c1');
    const firstCheckout = useStore.getState().checkouts['c1'];
    expect(firstCheckout).toBeDefined();
    expect(firstCheckout.attemptsUsed).toBe(0);
    expect(typeof firstCheckout.at).toBe('number');

    // Manually modify attempts to check it does not overwrite
    useStore.getState().incrementAttempts('c1');
    expect(useStore.getState().checkouts['c1'].attemptsUsed).toBe(1);

    // Call checkout again on existing id
    checkout('c1');
    expect(useStore.getState().checkouts['c1'].attemptsUsed).toBe(1);
    expect(useStore.getState().checkouts['c1'].at).toBe(firstCheckout.at);
  });

  it('saveDraft saves payload to drafts', () => {
    const { saveDraft } = useStore.getState();
    saveDraft('c1', { code: 'const x = 1;' });
    expect(useStore.getState().drafts['c1']).toEqual({ code: 'const x = 1;' });
  });

  it('addSubmission appends submission to submissions array', () => {
    const { addSubmission } = useStore.getState();
    const submission: Submission = {
      id: 'sub-1',
      challengeId: 'c1',
      prNumber: 42,
      openedAt: 1000,
      payload: { code: 'test' },
      result: { passed: true, scoreFraction: 1, feedback: [] },
      awardedXp: 100,
    };
    addSubmission(submission);
    expect(useStore.getState().submissions).toHaveLength(1);
    expect(useStore.getState().submissions[0]).toEqual(submission);
  });

  it('incrementAttempts increments attemptsUsed by 1', () => {
    const { checkout, incrementAttempts } = useStore.getState();
    checkout('c2');
    expect(useStore.getState().checkouts['c2'].attemptsUsed).toBe(0);
    incrementAttempts('c2');
    expect(useStore.getState().checkouts['c2'].attemptsUsed).toBe(1);
    incrementAttempts('c2');
    expect(useStore.getState().checkouts['c2'].attemptsUsed).toBe(2);
  });

  it('addActivity appends to activity array', () => {
    const { addActivity } = useStore.getState();
    const entry: ActivityEntry = {
      id: 'act-1',
      at: 1000,
      actor: 'You',
      verb: 'opened',
      challengeSlug: 'two-sum',
      xp: 50,
    };
    addActivity(entry);
    expect(useStore.getState().activity).toEqual([entry]);
  });

  it('toggleNotify toggles notification flag', () => {
    const { toggleNotify } = useStore.getState();
    expect(useStore.getState().notify['c1']).toBeUndefined();
    toggleNotify('c1');
    expect(useStore.getState().notify['c1']).toBe(true);
    toggleNotify('c1');
    expect(useStore.getState().notify['c1']).toBe(false);
  });

  it('setOrganizerMode sets organizerMode boolean', () => {
    const { setOrganizerMode } = useStore.getState();
    expect(useStore.getState().organizerMode).toBe(false);
    setOrganizerMode(true);
    expect(useStore.getState().organizerMode).toBe(true);
    setOrganizerMode(false);
    expect(useStore.getState().organizerMode).toBe(false);
  });

  it('approveSubmission finds submission by id and sets approvedAt', () => {
    const { addSubmission, approveSubmission } = useStore.getState();
    const sub: Submission = {
      id: 'sub-target',
      challengeId: 'c1',
      prNumber: 99,
      openedAt: 1000,
      payload: {},
      result: { passed: true, scoreFraction: 1, feedback: [] },
      awardedXp: 100,
    };
    addSubmission(sub);
    expect(useStore.getState().submissions[0].approvedAt).toBeUndefined();

    approveSubmission('sub-target');
    const updated = useStore.getState().submissions[0];
    expect(updated.approvedAt).toBeDefined();
    expect(typeof updated.approvedAt).toBe('number');
  });

  it('addCustomChallenge appends challenge to customChallenges', () => {
    const { addCustomChallenge } = useStore.getState();
    const challenge: Challenge = {
      id: 'custom-1',
      slug: 'custom-one',
      title: 'Custom One',
      tagline: 'Custom test',
      category: 'algorithms',
      difficulty: 'easy',
      type: 'code',
      points: 100,
      opensAt: new Date().toISOString(),
      closesAt: new Date(Date.now() + 86400000).toISOString(),
      maxAttempts: 3,
      description: 'Desc',
      requirements: [],
      rules: [],
      tags: [],
      author: 'Tester',
      config: {
        type: 'code',
        fnName: 'fn',
        starter: 'code',
        visibleTests: [],
        hiddenTests: [],
      },
    };
    addCustomChallenge(challenge);
    expect(useStore.getState().customChallenges).toEqual([challenge]);
  });

  it('updateProfile updates name and id while preserving branch and year', () => {
    const { updateProfile } = useStore.getState();
    updateProfile('Alice', '24IT099');
    expect(useStore.getState().profile).toEqual({
      name: 'Alice',
      id: '24IT099',
      branch: 'CE',
      year: 3,
    });
  });

  it('setSettings merges into settings', () => {
    const { setSettings } = useStore.getState();
    expect(useStore.getState().settings.demoAutoMerge).toBe(true);
    setSettings({ demoAutoMerge: false });
    expect(useStore.getState().settings.demoAutoMerge).toBe(false);
  });

  it('resetDemo resets store to initial defaults', () => {
    const state = useStore.getState();
    state.checkout('c1');
    state.setTheme('light');
    state.setOrganizerMode(true);
    state.updateProfile('Bob', '21CSE001');

    state.resetDemo();

    const resetState = useStore.getState();
    expect(resetState.checkouts).toEqual({});
    expect(resetState.theme).toBe('dark');
    expect(resetState.organizerMode).toBe(false);
    expect(resetState.profile).toEqual({
      name: 'You',
      id: '24CE000',
      branch: 'CE',
      year: 3,
    });
  });

  it('setTheme updates theme', () => {
    const { setTheme } = useStore.getState();
    setTheme('light');
    expect(useStore.getState().theme).toBe('light');
    setTheme('dark');
    expect(useStore.getState().theme).toBe('dark');
  });

  it('partialize excludes action functions and only includes state data', () => {
    const partialize = useStore.persist.getOptions().partialize;
    expect(partialize).toBeDefined();
    if (partialize) {
      const persisted = partialize(useStore.getState());
      // Check data keys exist
      expect(persisted).toHaveProperty('version', 1);
      expect(persisted).toHaveProperty('profile');
      expect(persisted).toHaveProperty('theme');
      expect(persisted).toHaveProperty('organizerMode');
      expect(persisted).toHaveProperty('checkouts');
      expect(persisted).toHaveProperty('drafts');
      expect(persisted).toHaveProperty('submissions');
      expect(persisted).toHaveProperty('dailyResults');
      expect(persisted).toHaveProperty('customChallenges');
      expect(persisted).toHaveProperty('upvotes');
      expect(persisted).toHaveProperty('notify');
      expect(persisted).toHaveProperty('activity');
      expect(persisted).toHaveProperty('settings');

      // Check actions are NOT included
      expect((persisted as Record<string, unknown>).setTheme).toBeUndefined();
      expect((persisted as Record<string, unknown>).checkout).toBeUndefined();
      expect((persisted as Record<string, unknown>).saveDraft).toBeUndefined();
      expect((persisted as Record<string, unknown>).addSubmission).toBeUndefined();
      expect((persisted as Record<string, unknown>).resetDemo).toBeUndefined();
    }
  });

  it('migrate resets state if version is not 1 and excludes actions', () => {
    const migrate = useStore.persist.getOptions().migrate;
    expect(migrate).toBeDefined();
    if (migrate) {
      const migrated = migrate({ someOldField: 'old' }, 0) as Record<string, unknown>;
      expect(migrated.version).toBe(1);
      expect(migrated.profile).toEqual({
        name: 'You',
        id: '24CE000',
        branch: 'CE',
        year: 3,
      });
      expect(migrated.setTheme).toBeUndefined();
      expect(migrated.checkout).toBeUndefined();
    }
  });
});
