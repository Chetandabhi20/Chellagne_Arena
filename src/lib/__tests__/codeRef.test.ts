import { describe, it, expect } from 'vitest';
import { challenges } from '../../data/challenges';


function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b)) return true;
  if (a === null || b === null || typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const keys = Object.keys(aObj);
    if (keys.length !== Object.keys(bObj).length) return false;
    return keys.every((k) => deepEqual(aObj[k], bObj[k]));
  }
  return false;
}

const refSolutions: Record<string, (...args: unknown[]) => unknown> = {
  mergeSorted: (a: unknown, b: unknown) => {
    const arrA = a as number[];
    const arrB = b as number[];
    const result = [];
    let i = 0, j = 0;
    while (i < arrA.length && j < arrB.length) {
      if (arrA[i] <= arrB[j]) result.push(arrA[i++]);
      else result.push(arrB[j++]);
    }
    while (i < arrA.length) result.push(arrA[i++]);
    while (j < arrB.length) result.push(arrB[j++]);
    return result;
  },
  twoSum: (commits: unknown, target: unknown) => {
    const arr = commits as number[];
    const tgt = target as number;
    const map = new Map<number, number>();
    for (let i = 0; i < arr.length; i++) {
      const complement = tgt - arr[i];
      if (map.has(complement)) return [map.get(complement), i];
      map.set(arr[i], i);
    }
    return [];
  },
  cartTotal: (items: unknown) => {
    const arr = items as { price: number; discountPercent?: number; qty: number }[];
    let total = 0;
    for (const item of arr) {
      let price = item.price * item.qty;
      if (item.discountPercent) {
        price = price * (1 - item.discountPercent / 100);
      }
      total += price;
    }
    return Math.round(total * 100) / 100;
  },
};

const codeChallenges = challenges.filter(c => c.type === 'code');

describe('Reference solutions pass all seeded code tests', () => {
  for (const challenge of codeChallenges) {
    const config = challenge.config;
    if (config.type !== 'code') continue;
    
    const fn = refSolutions[config.fnName];
    if (!fn) {
      it(`${challenge.slug}: reference solution exists`, () => {
        throw new Error(`No reference solution for ${config.fnName}`);
      });
      continue;
    }
    
    const allTests = [...config.visibleTests, ...config.hiddenTests];
    describe(challenge.slug, () => {
      for (const tc of allTests) {
        it(tc.label || JSON.stringify(tc.args), () => {
          const result = fn(...tc.args);
          expect(deepEqual(result, tc.expected)).toBe(true);
        });
      }
    });
  }
});

describe('Reference regex passes validate-roll-number tests', () => {
  const regexChallenge = challenges.find(c => c.slug === 'validate-roll-number');
  it('passes all match and reject strings', () => {
    expect(regexChallenge).toBeDefined();
    if (!regexChallenge || regexChallenge.config.type !== 'regex') return;
    
    const config = regexChallenge.config;
    const regex = /^\d{2}(CE|IT|CSE|EC)\d{3}$/;
    
    for (const str of config.shouldMatch) {
      expect(regex.test(str)).toBe(true);
    }
    for (const str of config.hiddenMatch) {
      expect(regex.test(str)).toBe(true);
    }
    for (const str of config.shouldReject) {
      expect(regex.test(str)).toBe(false);
    }
    for (const str of config.hiddenReject) {
      expect(regex.test(str)).toBe(false);
    }
  });
});
