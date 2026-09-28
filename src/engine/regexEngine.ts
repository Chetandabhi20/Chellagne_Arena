import type { Challenge, ChallengeConfig } from '../types';
import type { Engine, CheckOutput } from './types';
import { runRegexInWorker, type RegexTestCase } from './regexRunner';

export interface RegexPayload {
  pattern: string;
  flags: string;
}

export const regexEngine: Engine<RegexPayload> = {
  async run(challenge: Challenge, payload: RegexPayload): Promise<CheckOutput> {
    const config = challenge.config as ChallengeConfig & { type: 'regex' };
    const tests: RegexTestCase[] = [
      ...config.shouldMatch.map(str => ({ str, shouldMatch: true })),
      ...config.shouldReject.map(str => ({ str, shouldMatch: false }))
    ];
    
    const result = await runRegexInWorker(payload.pattern, payload.flags, tests);
    if (result.error) {
      return { passed: false, scoreFraction: 0, feedback: [result.error] };
    }
    
    const passed = result.results.every(r => r.ok);
    return {
      passed,
      scoreFraction: passed ? 1 : 0,
      feedback: result.results.filter(r => !r.ok).map(r => `Failed on "${r.str}" (expected ${r.matched ? 'reject' : 'match'})`)
    };
  },
  
  async submit(challenge: Challenge, payload: RegexPayload): Promise<CheckOutput> {
    const config = challenge.config as ChallengeConfig & { type: 'regex' };
    const tests: RegexTestCase[] = [
      ...config.shouldMatch.map(str => ({ str, shouldMatch: true })),
      ...config.shouldReject.map(str => ({ str, shouldMatch: false })),
      ...config.hiddenMatch.map(str => ({ str, shouldMatch: true })),
      ...config.hiddenReject.map(str => ({ str, shouldMatch: false }))
    ];
    
    const result = await runRegexInWorker(payload.pattern, payload.flags, tests);
    if (result.error) {
      return { passed: false, scoreFraction: 0, feedback: [result.error] };
    }
    
    const passed = result.results.every(r => r.ok);
    const visibleCount = config.shouldMatch.length + config.shouldReject.length;
    const hiddenCount = config.hiddenMatch.length + config.hiddenReject.length;
    
    const visibleResults = result.results.slice(0, visibleCount);
    const hiddenResults = result.results.slice(visibleCount);
    
    const hiddenPassedCount = hiddenResults.filter(r => r.ok).length;
    
    let feedback = visibleResults.filter(r => !r.ok).map(r => `Visible check failed: ${r.str}`);
    
    if (hiddenPassedCount < hiddenCount) {
       feedback.push(`Hidden: ${hiddenPassedCount} of ${hiddenCount} passed`);
    } else if (hiddenCount > 0) {
       feedback.push(`Hidden: ${hiddenCount} of ${hiddenCount} passed`);
    }
    
    return {
      passed,
      scoreFraction: passed ? 1 : 0,
      feedback: feedback.length ? feedback : ['All checks passed']
    };
  }
};
