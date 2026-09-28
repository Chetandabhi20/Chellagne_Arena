/**
 * Simple deterministic hash (djb2 variant) — returns a positive 32-bit integer.
 * Used for seeded PRNG, daily pick, and commit hash display.
 */
export function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Returns the first 7 hex characters of a deterministic hash of the input.
 * Used for displaying fake commit hashes in the activity feed.
 */
export function commitHash(input: string): string {
  const h = djb2(input);
  // XOR with a second pass for more entropy
  const h2 = djb2(input + ':salt');
  return ((h ^ h2) >>> 0).toString(16).padStart(8, '0').slice(0, 7);
}

/**
 * Mulberry32 seeded PRNG — returns a function that yields [0, 1) on each call.
 */
export function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1) >>> 0;
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
