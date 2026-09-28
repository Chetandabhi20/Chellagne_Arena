import type { Engine, CheckOutput } from './types';
import type { Challenge } from '../types';
import { runCodeInWorker } from './codeRunner';

export const codeEngine: Engine<string> = {
  async run(challenge: Challenge, payload: string): Promise<CheckOutput> {
    if (challenge.type !== 'code') throw new Error('Expected code challenge');
    const config = challenge.config as Extract<Challenge['config'], { type: 'code' }>;
    const { fnName, visibleTests } = config;

    const result = await runCodeInWorker({
      code: payload,
      fnName,
      tests: visibleTests,
    });

    if (result.error) {
      return {
        passed: false,
        scoreFraction: 0,
        feedback: [result.error],
        details: { logs: result.logs }
      };
    }

    const passed = result.results.every(r => r.ok);
    
    // For run, we map results to feedback list for UI display
    return {
      passed,
      scoreFraction: passed ? 1 : 0,
      feedback: result.results.map((r, i) => {
        const label = visibleTests[i].label || `Test ${i + 1}`;
        if (r.ok) return `✓ ${label}`;
        return `✕ ${label}: ${r.error || `expected ${JSON.stringify(visibleTests[i].expected)}, got ${JSON.stringify(r.actual)}`}`;
      }),
      details: {
        results: result.results,
        logs: result.logs
      }
    };
  },

  async submit(challenge: Challenge, payload: string): Promise<CheckOutput> {
    if (challenge.type !== 'code') throw new Error('Expected code challenge');
    const config = challenge.config as Extract<Challenge['config'], { type: 'code' }>;
    const { fnName, visibleTests, hiddenTests } = config;

    const allTests = [...visibleTests, ...hiddenTests];
    
    const result = await runCodeInWorker({
      code: payload,
      fnName,
      tests: allTests,
    });

    if (result.error) {
      return {
        passed: false,
        scoreFraction: 0,
        feedback: [result.error],
        details: { logs: result.logs }
      };
    }

    const passed = result.results.every(r => r.ok);
    
    const feedback: string[] = [];
    
    result.results.forEach((r, i) => {
      if (i < visibleTests.length) {
        const label = visibleTests[i].label || `Test ${i + 1}`;
        if (r.ok) feedback.push(`✓ ${label}`);
        else feedback.push(`✕ ${label}: ${r.error || `expected ${JSON.stringify(visibleTests[i].expected)}, got ${JSON.stringify(r.actual)}`}`);
      } else {
        const hiddenIndex = i - visibleTests.length + 1;
        if (r.ok) feedback.push(`✓ Hidden test ${hiddenIndex}`);
        else feedback.push(`✕ Hidden test ${hiddenIndex}: failed`);
      }
    });

    return {
      passed,
      scoreFraction: passed ? 1 : 0,
      feedback,
      details: {
        results: result.results,
        logs: result.logs
      }
    };
  }
};
