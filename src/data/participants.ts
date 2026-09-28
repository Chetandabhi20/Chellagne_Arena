import type { Participant } from '../types';

export const participants: Participant[] = [
  { id: '24CE045', name: 'Rutvi Patel', branch: 'CE', year: 3, allTimeXp: 1180, weeklyXp: 340, streak: 9 },
  { id: '23IT012', name: 'Harsh Solanki', branch: 'IT', year: 4, allTimeXp: 1120, weeklyXp: 210, streak: 5 },
  { id: '24CSE031', name: 'Dhruv Parmar', branch: 'CSE', year: 3, allTimeXp: 1040, weeklyXp: 300, streak: 7 },
  { id: '25CE018', name: 'Meera Joshi', branch: 'CE', year: 2, allTimeXp: 985, weeklyXp: 320, streak: 11 },
  { id: '24IT027', name: 'Kunal Trivedi', branch: 'IT', year: 3, allTimeXp: 910, weeklyXp: 150, streak: 3 },
  { id: '23CE066', name: 'Aarav Shah', branch: 'CE', year: 4, allTimeXp: 860, weeklyXp: 180, streak: 4 },
  { id: '25CSE009', name: 'Nidhi Desai', branch: 'CSE', year: 2, allTimeXp: 790, weeklyXp: 240, streak: 6 },
  { id: '24EC014', name: 'Yash Vaghela', branch: 'EC', year: 3, allTimeXp: 720, weeklyXp: 120, streak: 2 },
  { id: '25IT041', name: 'Priya Chauhan', branch: 'IT', year: 2, allTimeXp: 665, weeklyXp: 200, streak: 8 },
  { id: '26CE007', name: 'Jay Rathod', branch: 'CE', year: 1, allTimeXp: 540, weeklyXp: 260, streak: 5 },
  { id: '24CE082', name: 'Krisha Mehta', branch: 'CE', year: 3, allTimeXp: 505, weeklyXp: 90, streak: 1 },
  { id: '23CSE022', name: 'Smit Bhatt', branch: 'CSE', year: 4, allTimeXp: 470, weeklyXp: 70, streak: 0 },
  { id: '25EC030', name: 'Isha Panchal', branch: 'EC', year: 2, allTimeXp: 420, weeklyXp: 110, streak: 3 },
  { id: '26IT015', name: 'Vansh Gohil', branch: 'IT', year: 1, allTimeXp: 360, weeklyXp: 180, streak: 4 },
  { id: '24CSE059', name: 'Tanvi Modi', branch: 'CSE', year: 3, allTimeXp: 300, weeklyXp: 60, streak: 2 },
  { id: '26CE033', name: 'Om Rashiya', branch: 'CE', year: 1, allTimeXp: 240, weeklyXp: 140, streak: 3 },
  { id: '25CE071', name: 'Deep Makwana', branch: 'CE', year: 2, allTimeXp: 180, weeklyXp: 40, streak: 0 },
  { id: '26CSE004', name: 'Ananya Dave', branch: 'CSE', year: 1, allTimeXp: 95, weeklyXp: 45, streak: 1 },
];

/** Base XP the demo user starts with (beyond merged PRs) */
export const YOU_BASE_XP = 120;

/** The demo user's default profile */
export const DEFAULT_PROFILE = {
  name: 'You',
  id: '24CE000',
  branch: 'CE' as const,
  year: 3 as const,
};
