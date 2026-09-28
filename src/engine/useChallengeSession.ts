import { useCallback, useMemo, useRef } from 'react';
import { useStore } from '../store/useStore';
import type { Challenge, Submission } from '../types';
import type { CheckOutput } from './types';
import { quizEngine } from './quizEngine';
import { linkEngine } from './linkEngine';
import { challengeStatus, attemptsLeft, bestSubmission, prState, challengeSubmissions } from '../lib/selectors';
import { toast } from '../components/ui/Toast';

type EngineResult = CheckOutput;

function getEngine(type: Challenge['type']) {
  switch (type) {
    case 'quiz': return quizEngine;
    case 'link': return linkEngine;
    // code, regex, frontend, git-terminal added in later phases
    default: return null;
  }
}

/**
 * Shared hook that wires a challenge engine to the store.
 * Handles checkout, drafts, attempts, submissions, toasts, and activity.
 * Solver panels are thin UI on top of this hook.
 */
export function useChallengeSession(challenge: Challenge) {
  const store = useStore();
  const prCounterRef = useRef(0);

  const now = Date.now();
  const status = challengeStatus(challenge, now);
  const checkout = store.checkouts[challenge.id];
  const isCheckedOut = checkout != null;
  const isPractice = status === 'completed';

  const remaining = useMemo(() => {
    if (!checkout) return challenge.maxAttempts;
    return attemptsLeft(challenge.maxAttempts, checkout.attemptsUsed);
  }, [checkout, challenge.maxAttempts]);

  const submissions = useMemo(
    () => challengeSubmissions(store.submissions, challenge.id),
    [store.submissions, challenge.id]
  );

  const best = useMemo(
    () => bestSubmission(store.submissions, challenge.id),
    [store.submissions, challenge.id]
  );

  const latestPrState = useMemo(() => {
    if (!best) return null;
    return prState(best, challenge.type, now, store.settings.demoAutoMerge);
  }, [best, challenge.type, now, store.settings.demoAutoMerge]);

  const draft = store.drafts[challenge.id];

  const doCheckout = useCallback(() => {
    if (isCheckedOut) return;
    store.checkout(challenge.id);
    store.addActivity({
      id: `act-${Date.now()}-checkout`,
      at: Date.now(),
      actor: store.profile.name,
      verb: 'checked-out',
      challengeSlug: challenge.slug,
    });
  }, [challenge.id, challenge.slug, isCheckedOut, store]);

  const saveDraft = useCallback((payload: unknown) => {
    store.saveDraft(challenge.id, payload);
  }, [challenge.id, store]);

  const run = useCallback(async (payload: unknown): Promise<EngineResult | null> => {
    const engine = getEngine(challenge.type);
    if (!engine) {
      toast({ type: 'info', message: `Engine for "${challenge.type}" not yet available.` });
      return null;
    }
    // run() does NOT consume attempts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- payload type varies by engine
    const result = await (engine as any).run(challenge, payload);
    return result;
  }, [challenge]);

  const submit = useCallback(async (payload: unknown): Promise<EngineResult | null> => {
    const engine = getEngine(challenge.type);
    if (!engine) {
      toast({ type: 'info', message: `Engine for "${challenge.type}" not yet available.` });
      return null;
    }

    // Check attempts
    if (remaining !== null && remaining <= 0) {
      toast({ type: 'error', message: 'No attempts left.' });
      return null;
    }

    // Increment attempts (submit consumes one)
    if (!isPractice) {
      store.incrementAttempts(challenge.id);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- payload type varies by engine
    const result = await (engine as any).submit(challenge, payload);

    // Calculate XP
    const awardedXp = result.passed && !isPractice
      ? Math.round(challenge.points * result.scoreFraction)
      : 0;

    // Generate PR number
    const maxPr = store.submissions.reduce((max, s) => Math.max(max, s.prNumber), 100);
    prCounterRef.current = maxPr + 1;

    const submission: Submission = {
      id: `sub-${Date.now()}-${prCounterRef.current}`,
      challengeId: challenge.id,
      prNumber: prCounterRef.current,
      openedAt: Date.now(),
      payload,
      result: {
        passed: result.passed,
        scoreFraction: result.scoreFraction,
        feedback: result.feedback,
      },
      awardedXp,
      practice: isPractice || undefined,
    };

    store.addSubmission(submission);

    // Toast for result
    if (result.passed && !isPractice) {
      store.addActivity({
        id: `act-${Date.now()}-submit`,
        at: Date.now(),
        actor: store.profile.name,
        verb: 'opened',
        challengeSlug: challenge.slug,
        xp: awardedXp,
      });
      toast({ type: 'success', message: `PR #${prCounterRef.current} opened! +${awardedXp} XP` });
    } else if (result.passed && isPractice) {
      toast({ type: 'info', message: `Practice run: ${result.feedback[0]}` });
    } else {
      const newRemaining = remaining !== null ? remaining - 1 : null;
      const attMsg = newRemaining !== null ? ` (${newRemaining} attempt${newRemaining !== 1 ? 's' : ''} left)` : '';
      toast({ type: 'error', message: `Checks failed.${attMsg}` });
    }

    return result;
  }, [challenge, remaining, isPractice, store]);

  return {
    status,
    isCheckedOut,
    isPractice,
    checkout: checkout ?? null,
    remaining,
    submissions,
    best,
    latestPrState,
    draft,
    doCheckout,
    saveDraft,
    run,
    submit,
  };
}
