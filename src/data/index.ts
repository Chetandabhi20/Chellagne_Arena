export { participants, YOU_BASE_XP, DEFAULT_PROFILE } from './participants';
export { challenges } from './challenges';
export { dailyPool } from './dailyPool';
export { seedActivity } from './activity';
export { gallerySeed } from './gallery';
export type { GallerySeed } from './gallery';

/**
 * Seed heatmap offsets for the demo user's contribution history.
 * Days relative to today (negative = past). Days -1 and -2 are the
 * mandatory streak days. Others create a lived-in heatmap.
 */
export const SEED_HEATMAP_OFFSETS: number[] = [
  -1, -2,          // streak days (mandatory)
  -5, -6,          // a cluster last week
  -11, -13,        // scattered week before
  -18, -21, -22,   // two weeks ago
  -30, -35,        // a month ago
  -42, -50, -55,   // older scattered activity
  -63, -70,        // edge of the 16-week window
];

/** Season end: 26 days from today */
export const SEASON_END_OFFSET = 26;
