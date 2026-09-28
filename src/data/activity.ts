import type { ActivityEntry } from '../types';

const now = Date.now();
const h = (hours: number) => now - hours * 3_600_000;

export const seedActivity: ActivityEntry[] = [
  { id: 'sa-01', at: h(0.4), actor: 'Rutvi Patel', verb: 'merged', challengeSlug: 'validate-roll-number', xp: 150 },
  { id: 'sa-02', at: h(1), actor: 'Meera Joshi', verb: 'opened', challengeSlug: 'rebuild-landing-page' },
  { id: 'sa-03', at: h(2), actor: 'Dhruv Parmar', verb: 'merged', challengeSlug: 'merge-sorted-commits', xp: 100 },
  { id: 'sa-04', at: h(3), actor: 'Jay Rathod', verb: 'checked-out', challengeSlug: 'git-trivia-sprint' },
  { id: 'sa-05', at: h(5), actor: 'Nidhi Desai', verb: 'merged', challengeSlug: 'center-that-div', xp: 100 },
  { id: 'sa-06', at: h(8), actor: 'Harsh Solanki', verb: 'merged', challengeSlug: 'git-trivia-sprint', xp: 100 },
  { id: 'sa-07', at: h(12), actor: 'Priya Chauhan', verb: 'opened', challengeSlug: 'validate-roll-number' },
  { id: 'sa-08', at: h(20), actor: 'Kunal Trivedi', verb: 'merged', challengeSlug: 'merge-sorted-commits', xp: 100 },
  { id: 'sa-09', at: h(26), actor: 'Aarav Shah', verb: 'checked-out', challengeSlug: 'rebuild-landing-page' },
  { id: 'sa-10', at: h(30), actor: 'Vansh Gohil', verb: 'merged', challengeSlug: 'debug-broken-cart', xp: 150 },
  { id: 'sa-11', at: h(40), actor: 'Isha Panchal', verb: 'merged', challengeSlug: 'debug-broken-cart', xp: 150 },
  { id: 'sa-12', at: h(50), actor: 'Yash Vaghela', verb: 'opened', challengeSlug: 'center-that-div' },
];
