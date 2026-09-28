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
  checkout: (challengeId: string) => void;
  saveDraft: (challengeId: string, payload: unknown) => void;
  addSubmission: (submission: Submission) => void;
  incrementAttempts: (challengeId: string) => void;
  addActivity: (entry: ActivityEntry) => void;
  addDailyResult: (result: DailyResult) => void;
  toggleNotify: (challengeId: string) => void;
  setOrganizerMode: (on: boolean) => void;
  approveSubmission: (submissionId: string) => void;
  addCustomChallenge: (challenge: Challenge) => void;
  resetDemo: () => void;
  updateProfile: (name: string, id: string) => void;
  setSettings: (settings: Partial<AppState['settings']>) => void;
}

export type AppPersistedState = {
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
};

const getInitialData = (): AppPersistedState => ({
  version: 1,
  profile: {
    name: 'You',
    id: '24CE000',
    branch: 'CE',
    year: 3,
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
});

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      ...getInitialData(),

      setTheme: (theme) => set({ theme }),

      checkout: (challengeId) =>
        set((state) => {
          if (state.checkouts[challengeId]) {
            return state;
          }
          return {
            checkouts: {
              ...state.checkouts,
              [challengeId]: { at: Date.now(), attemptsUsed: 0 },
            },
          };
        }),

      saveDraft: (challengeId, payload) =>
        set((state) => ({
          drafts: {
            ...state.drafts,
            [challengeId]: payload,
          },
        })),

      addSubmission: (submission) =>
        set((state) => ({
          submissions: [...state.submissions, submission],
        })),

      incrementAttempts: (challengeId) =>
        set((state) => {
          const current = state.checkouts[challengeId];
          return {
            checkouts: {
              ...state.checkouts,
              [challengeId]: current
                ? { ...current, attemptsUsed: current.attemptsUsed + 1 }
                : { at: Date.now(), attemptsUsed: 1 },
            },
          };
        }),

      addActivity: (entry) =>
        set((state) => ({
          activity: [...state.activity, entry],
        })),

      addDailyResult: (result) =>
        set((state) => ({
          dailyResults: [...state.dailyResults, result],
        })),

      toggleNotify: (challengeId) =>
        set((state) => ({
          notify: {
            ...state.notify,
            [challengeId]: !state.notify[challengeId],
          },
        })),

      setOrganizerMode: (on) => set({ organizerMode: on }),

      approveSubmission: (submissionId) =>
        set((state) => ({
          submissions: state.submissions.map((sub) =>
            sub.id === submissionId ? { ...sub, approvedAt: Date.now() } : sub
          ),
        })),

      addCustomChallenge: (challenge) =>
        set((state) => ({
          customChallenges: [...state.customChallenges, challenge],
        })),

      resetDemo: () => set(getInitialData()),

      updateProfile: (name, id) =>
        set((state) => ({
          profile: {
            ...state.profile,
            name,
            id,
          },
        })),

      setSettings: (settings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...settings,
          },
        })),
    }),
    {
      name: 'gitclub-arena:v1',
      storage: createJSONStorage(() => safeStorage),
      version: 1,
      partialize: (state) => ({
        version: state.version,
        profile: state.profile,
        theme: state.theme,
        organizerMode: state.organizerMode,
        checkouts: state.checkouts,
        drafts: state.drafts,
        submissions: state.submissions,
        dailyResults: state.dailyResults,
        customChallenges: state.customChallenges,
        upvotes: state.upvotes,
        notify: state.notify,
        activity: state.activity,
        settings: state.settings,
      }),
      migrate: (persistedState: unknown, version: number) => {
        if (version !== 1) {
          return getInitialData();
        }
        return persistedState as AppPersistedState;
      },
    }
  )
);
