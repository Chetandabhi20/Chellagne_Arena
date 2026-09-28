export type ChallengeType =
  | "code"
  | "quiz"
  | "regex"
  | "frontend"
  | "link"
  | "git-terminal";
export type Difficulty = "easy" | "medium" | "hard";
export type Category =
  | "algorithms"
  | "web-dev"
  | "git-tools"
  | "problem-solving"
  | "design"
  | "open-build";
export type ChallengeStatus = "upcoming" | "active" | "completed";
export type PRState = "open" | "in-review" | "merged";

export interface Challenge {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  category: Category;
  difficulty: Difficulty;
  type: ChallengeType;
  points: number;
  opensAt: string;
  closesAt: string;
  maxAttempts: number | null;
  description: string;
  requirements: string[];
  rules: string[];
  tags: string[];
  author: string;
  gallery?: boolean;
  config: ChallengeConfig;
  custom?: boolean;
}

export type ChallengeConfig =
  | {
      type: "code";
      fnName: string;
      starter: string;
      visibleTests: TestCase[];
      hiddenTests: TestCase[];
    }
  | {
      type: "quiz";
      timeLimitSec: number;
      passPercent: number;
      questions: QuizQuestion[];
    }
  | {
      type: "regex";
      brief: string;
      shouldMatch: string[];
      shouldReject: string[];
      hiddenMatch: string[];
      hiddenReject: string[];
    }
  | {
      type: "frontend";
      starterHtml: string;
      starterCss: string;
      checks: FrontendCheck[];
    }
  | {
      type: "link";
      linkKinds: ("github" | "figma" | "demo" | "drive" | "other")[];
      prompt: string;
    }
  | { type: "git-terminal"; scenarioId: string };

export interface TestCase {
  args: unknown[];
  expected: unknown;
  label?: string;
}
export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export type FrontendCheck =
  | { kind: "exists"; selector: string; min?: number; label: string; viewport?: number; }
  | { kind: "style"; selector: string; prop: string; matches: string; label: string; viewport?: number; }
  | { kind: "centered"; selector: string; within: string; axis: "x" | "y" | "both"; label: string; viewport?: number; }
  | { kind: "sameRow"; selector: string; min: number; label: string; viewport?: number; }
  | { kind: "stacked"; selector: string; min: number; label: string; viewport?: number; }
  | { kind: "textIncludes"; selector: string; text: string; label: string; viewport?: number; };

export interface Participant {
  id: string;
  name: string;
  branch: "CE" | "IT" | "CSE" | "EC";
  year: 1 | 2 | 3 | 4;
  allTimeXp: number;
  weeklyXp: number;
  streak: number;
}

export interface Submission {
  id: string;
  challengeId: string;
  prNumber: number;
  openedAt: number;
  payload: unknown;
  result: { passed: boolean; scoreFraction: number; feedback: string[] };
  awardedXp: number;
  approvedAt?: number;
  practice?: boolean;
}

export interface DailyResult {
  dateKey: string;
  answers: number[];
  correct: number;
  total: number;
}
export interface ActivityEntry {
  id: string;
  at: number;
  actor: string;
  verb: "merged" | "opened" | "checked-out" | "created";
  challengeSlug: string;
  xp?: number;
}
