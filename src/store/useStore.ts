import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from './safeStorage';
import type { Participant, Challenge, Submission, DailyResult, ActivityEntry } from '../types';

export interface AppState {
  version: 1;
  profile: {
    name: string;
    id: string;
    branch: Participant["branch"];
    year: Participant["year"];
  };
  theme: "light" | "dark";
  organizerMode: boolean;
  checkouts: Record<string, { at: number; attemptsUsed: number }>;
  drafts: Record<string, unknown>;
  submissions: Submission[];
  dailyResults: DailyResult[];
  customChallenges: Challenge[];
  upvotes: Record<string, string[]>;
  notify: Record<string, boolean>;
  activity: ActivityEntry[];
  settings: { demoAutoMerge: boolean };
  // Actions
  setTheme: (theme: "light" | "dark") => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      version: 1,
      profile: {
        name: 'You',
        id: '24CE000',
        branch: 'CE',
        year: 3
      },
      theme: 'dark',
      organizerMode: false,
      checkouts: {},
      drafts: {},
      submissions: [],
      dailyResults: [],
      customChallenges: [],
      upvotes: {},
      notify: {},
      activity: [],
      settings: { demoAutoMerge: true },
      
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'gitclub-arena:v1',
      storage: createJSONStorage(() => safeStorage),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version !== 1) {
          return {
            version: 1,
            profile: { name: 'You', id: '24CE000', branch: 'CE', year: 3 },
            theme: 'dark',
            organizerMode: false,
            checkouts: {},
            drafts: {},
            submissions: [],
            dailyResults: [],
            customChallenges: [],
            upvotes: {},
            notify: {},
            activity: [],
            settings: { demoAutoMerge: true },
          } as unknown as AppState;
        }
        return persistedState as AppState;
      },
    }
  )
);
