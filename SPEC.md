# SPEC.md: Git Club Challenge Arena

Software Requirements Specification and build contract for the coding agent.
Version 1.0. Single source of truth. If anything conflicts with a chat message, this file wins unless the human explicitly overrides it.

---

## 0. How to read this document

- **MUST** means required for the build to count as done. **SHOULD** means build it after all MUSTs work. **STRETCH** means only if everything else is finished, tested and deployed.
- Every feature has an ID (e.g. `F-ENG-03`). Use these IDs in commit messages and in your progress summaries.
- Where the spec gives exact values (colors, names, copy, thresholds, seed data), use them exactly. Do not invent alternatives.
- Where the spec says "derived", the value MUST be computed from other state by a pure function. It MUST NOT be stored separately. This is the main defense against inconsistent UI.
- Do not add libraries that are not listed in Section 3 without asking.

---

## 1. Product overview

### 1.1 One-sentence pitch

**Git Club Arena** is a challenge platform for the Git Club at CHARUSAT where a participant picks a challenge, `git checkout`s it, solves it in the browser, opens a pull request for their score, and climbs a season league.

### 1.2 Context

This is an entry for the Git Club CHARUSAT Website Challenge (Problem Statement 4: Challenge Arena). Around 150 individual participants will submit. Judges score: Problem Understanding, Functionality, UI/UX, Product Thinking, Visual Quality, Completeness, and Demonstration (a 5 to 6 minute screen recording). The build window is 7 hours. Backend is optional. This product uses **no backend**. All data is mock or simulated and lives in the browser.

### 1.3 What makes this entry different (protect these)

1. **Challenges are playable in the browser**, not just listed. Code runs against tests, regexes match live, HTML/CSS is checked against requirements.
2. **One challenge engine, many challenge types**, so the club can reuse the platform for any kind of challenge.
3. **An Organizer panel** lets the club create a challenge in about two minutes and review submissions. This proves the club can keep using the product after the hackathon.
4. **A strong git identity** in vocabulary, visuals and micro-copy. It must not look like a generic AI template.
5. **A "Next Action" bar on every screen**, computed from state, so the participant always knows what to do next.

### 1.4 Users

| Persona                                       | Need                                                                                             |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Participant (primary)                         | Find a challenge, understand it fast, solve or submit, see status and rank, know what to do next |
| First-year student who has never met the club | Understands what this is within about 5 seconds of landing                                       |
| Organizer (club committee member)             | Create challenges, review link submissions, see the participation picture                        |
| Judge / evaluator                             | Explore without instructions, no login, no broken buttons, open the live URL cold                |

### 1.5 Non-goals

- No real authentication, database, server, payments, or emails.
- No real remote code execution. Code runs client-side in a Web Worker.
- No multiplayer sync. Competitors are simulated seed data.
- No admin auth. "Organizer mode" is a simple toggle.

---

## 2. Git vocabulary (use this everywhere in UI copy)

| Real concept      | UI term                        | Example copy                                       |
| ----------------- | ------------------------------ | -------------------------------------------------- |
| Challenge         | branch                         | `challenge/regex-roll-number`                      |
| Start a challenge | checkout                       | button: `git checkout`                             |
| Submit            | pull request (PR)              | "Open pull request"                                |
| Submission status | PR state                       | `Open`, `In review`, `Merged`                      |
| Points            | XP (points shown as `+150 XP`) | "+150 XP"                                          |
| Activity feed     | commit log                     | `a3f9c21 rutvi merged "regex-roll-number" +150 XP` |
| Failed attempt    | failed checks                  | "Checks failed: 2 of 6 tests passed"               |
| Leaderboard       | League                         | "Season 1 League"                                  |
| Home              | Arena                          | page title "Arena"                                 |

Rules: use monospace styling for branch names, commit hashes, statuses, tags and numbers. Do not overdo puns. One clever line per screen is enough, and clarity beats cleverness.

---

## 3. Technology and constraints

| Concern         | Decision                                                                                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Build tool      | Vite + React 18 + TypeScript (strict)                                                                                                                                    |
| Styling         | Tailwind CSS with design tokens as CSS variables (Section 4)                                                                                                             |
| Routing         | React Router v6 (`BrowserRouter`)                                                                                                                                        |
| State           | Zustand with `persist` middleware and a **safe storage wrapper** (Section 6.4)                                                                                           |
| Command palette | `cmdk`                                                                                                                                                                   |
| Animation       | `framer-motion` (respect `prefers-reduced-motion`)                                                                                                                       |
| Code editor     | CodeMirror 6 (`@codemirror/state`, `view`, `lang-javascript`, `lang-html`, `lang-css`, `commands`, `theme-one-dark` or custom theme from tokens). **Do not use Monaco.** |
| Charts          | Recharts (SHOULD; only for the XP-over-time chart on My Progress)                                                                                                        |
| Icons           | `lucide-react` for UI icons only. No emoji as icons.                                                                                                                     |
| Tests           | Vitest for pure logic (engines, selectors). No UI tests required.                                                                                                        |
| Hosting         | Vercel. Add `vercel.json` with an SPA rewrite: `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`                                                   |
| Backend         | None                                                                                                                                                                     |

Hard constraints:

- **No `localStorage` calls outside the safe storage wrapper.** Every access is wrapped in try/catch and falls back to in-memory storage. The app MUST render correctly when storage is unavailable or empty.
- Lazy-load heavy routes and the editor: `React.lazy` for the challenge detail solver panels, Organizer, Gallery. The Arena home route MUST stay light.
- No remote images, no external fonts CDN dependency for critical rendering. Self-host fonts using `@fontsource/jetbrains-mono` and `@fontsource/inter` (npm packages, imported in `main.tsx`). Use only weights 400, 500, 700 (mono) and 400, 500, 600 (Inter).
- No `dangerouslySetInnerHTML` except the frontend-challenge preview, which uses `iframe srcDoc` (Section 8.4).
- Target: Lighthouse 90+ for Performance, Accessibility, Best Practices and SEO on the home route.

---

## 4. Design system

### 4.1 Principles

- Feels like a developer tool crossed with a friendly learning platform. Calm, dense but readable, terminal accents.
- **Forbidden:** gradients, purple or blue-purple accent colors, glassmorphism, emoji-as-icons, drop shadows larger than a 1px border plus a subtle 0 1px 0 shadow, stock illustrations, generic hero-with-blob layouts.
- Radius is **8px** for cards, inputs and buttons. Pills and tags use 999px. Modals use 12px.
- Borders are always 1px using `--border`.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64. Use only these.

### 4.2 Color tokens (exact)

Define as CSS variables on `:root` (light) and `:root[data-theme="dark"]` (dark). Tailwind config maps color names to these variables.

**Dark theme (default)**
| Token | Value |
|---|---|
| `--bg` | `#0B0F0E` |
| `--panel` | `#131A17` |
| `--panel-2` | `#192320` |
| `--border` | `#22302A` |
| `--text` | `#E6EDE8` |
| `--muted` | `#8A9A92` |
| `--accent` (git orange, primary actions) | `#F05133` |
| `--accent-fg` (text on accent) | `#0B0F0E` |
| `--success` (terminal green, merged) | `#3DDC97` |
| `--warning` (amber, in review) | `#FFB020` |
| `--danger` (red, failed) | `#FF5C5C` |

**Light theme**
| Token | Value |
|---|---|
| `--bg` | `#F6F4EE` |
| `--panel` | `#FFFFFF` |
| `--panel-2` | `#EFECE3` |
| `--border` | `#DDD8CB` |
| `--text` | `#16201B` |
| `--muted` | `#5C6B63` |
| `--accent` | `#D63E22` |
| `--accent-fg` | `#FFFFFF` |
| `--success` | `#127A4E` |
| `--warning` | `#9A6400` |
| `--danger` | `#C62F2F` |

All text and interactive states MUST meet WCAG AA (4.5:1) in both themes. Verify muted text on panel backgrounds. If a token fails, darken or lighten it slightly and note the change in the README.

Default theme: respect `prefers-color-scheme`; if none, dark. Persist the user's explicit choice. Set `data-theme` on `<html>` before first paint with a tiny inline script in `index.html` (wrapped in try/catch) to avoid a flash.

### 4.3 Typography

- **JetBrains Mono**: headings (h1 to h3), buttons' labels where it looks right, tags, badges, statuses, numbers, code, branch names, the header wordmark.
- **Inter**: body text, paragraphs, form labels, long descriptions.
- Scale (px / line-height): h1 32/40 (mobile 26/34), h2 22/30, h3 17/26, body 15/24, small 13/20, tiny mono 12/16.
- Never use letter-spacing hacks on body text.

### 4.4 Difficulty and status visuals

| Item              | Visual                                                                 |
| ----------------- | ---------------------------------------------------------------------- |
| Easy              | Small filled circle `--success` + mono text `easy`                     |
| Medium            | Circle `--warning` + `medium`                                          |
| Hard              | Circle `--accent` + `hard`                                             |
| Status: Active    | Mono pill, border `--success`, text `--success`, label `active`        |
| Status: Upcoming  | Pill, border `--warning`, label `upcoming`                             |
| Status: Completed | Pill, border `--muted`, label `completed`                              |
| PR: Open          | Pill border and text `--success`, hollow circle icon                   |
| PR: In review     | Pill `--warning`, spinner-like dot (static if reduced motion)          |
| PR: Merged        | Pill filled `--success` with `--accent-fg`-style dark text, check icon |

Color must never be the only signal: every status has a text label and an icon.

### 4.5 Challenge covers (no images)

Every challenge card and detail header shows a generated SVG cover: a deterministic abstract **git-graph** (nodes connected by branching lines) generated from a hash of the slug, drawn in `--border`, `--success`, `--accent`, `--warning` on `--panel-2`. Component: `<ChallengeCover slug size />`. Must be pure and cheap (no random calls; use a seeded PRNG such as mulberry32 seeded from the hash).

**3D Parallax Requirement:** The generated SVG elements MUST be structured into three distinct depth groups (background, midground, foreground) inside a container with `transform-style: preserve-3d`. Use `framer-motion` (`useMotionValue`, `useTransform`) to track the pointer coordinates over the card. Map the pointer's normalized position to `x` and `y` CSS translations so the layers shift at different speeds: the background moves slightly opposite to the cursor, the midground remains anchored, and the foreground moves further toward the cursor. This creates a spatial depth effect. This motion MUST be completely disabled when `prefers-reduced-motion: reduce` is detected.

### 4.6 Motion

- Use motion only for: leaderboard re-ranking (layout animation), toast enter/exit, PR state transitions, checkout terminal typing, wrong-answer shake (300ms), XP counter tick-up, **and the 3D parallax hover effect on Challenge Covers**.
- Cursor blink on hero: CSS animation, 1s steps. Disabled under `prefers-reduced-motion`.
- When `prefers-reduced-motion: reduce`: no shake, no layout animations, instant transitions, and **no parallax movement on covers**.

### 4.7 Global components (build once, reuse)

`Button` (primary, secondary, ghost, danger; sizes sm/md), `Tag`, `StatusPill`, `DifficultyDot`, `Card`, `Tabs` (URL-synced), `Modal` (focus trap, Esc closes), `Toast` system, `Skeleton`, `EmptyState` (icon + one line + one action), `ProgressBar`, `CountUp`, `Countdown`, `CodeBlock`, `Kbd`, `ChallengeCover`, `NextActionBar`, `CommitLine`.

---

## 5. Information architecture and routes

| Route               | Screen           | Notes                                                                          |
| ------------------- | ---------------- | ------------------------------------------------------------------------------ |
| `/`                 | Arena (home)     | Hero, Daily Commit tile, tabs and filters, challenge grid                      |
| `/challenges/:slug` | Challenge detail | Overview, checkout, solver panel, PR status                                    |
| `/daily`            | Daily Commit     | Micro-quiz, streak, share card                                                 |
| `/progress`         | My Progress      | XP, level, streak heatmap, badges, PR list                                     |
| `/leaderboard`      | League           | Ranking, tiers, weekly/all-time                                                |
| `/gallery`          | Gallery          | SHOULD: design/link submissions with upvotes                                   |
| `/organizer`        | Organizer panel  | Visible only when Organizer mode is on                                         |
| `*`                 | 404              | On-brand: `fatal: pathspec '<path>' did not match any files`, with a link home |

Persistent shell on all routes:

- **Header** (sticky): wordmark `git-club / arena` with a branch glyph, nav (Arena, Daily, Progress, League, Gallery), Ctrl+K button (shows `Ctrl K`, or `⌘K` on Mac), theme toggle, profile chip (initials + `XP`), overflow menu (Organizer mode toggle, Reset demo).
- **Next Action bar** (directly below the header; Section 7).
- **Footer status line**, styled like an editor status bar: `main` branch glyph, current level name, `N XP`, `streak N`, and a link "Git Club CHARUSAT". On mobile it is hidden and replaced by the tab bar.
- **Mobile bottom tab bar** (below 768px): Arena, Daily, Progress, League, More. Minimum 44px tap targets.
- **Toast region** (bottom-right desktop, top on mobile, `aria-live="polite"`).

Per-route `document.title`: `<Page> · Git Club Arena`. Implement with a small `usePageTitle` hook.

---

## 6. Data model and state

### 6.1 Types (put in `src/types.ts`, use exactly)

```ts
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
export type ChallengeStatus = "upcoming" | "active" | "completed"; // DERIVED, never stored
export type PRState = "open" | "in-review" | "merged"; // DERIVED, never stored

export interface Challenge {
  id: string; // same as slug
  slug: string; // kebab-case, used in URL and branch name
  title: string;
  tagline: string; // one line, max 80 chars
  category: Category;
  difficulty: Difficulty;
  type: ChallengeType;
  points: number; // XP awarded on merge
  opensAt: string; // ISO datetime
  closesAt: string; // ISO datetime
  maxAttempts: number | null; // null = unlimited
  description: string; // paragraphs separated by blank lines; supports `inline code` only
  requirements: string[];
  rules: string[];
  tags: string[]; // technologies or skills, e.g. ['javascript','arrays']
  author: string; // display name of the organizer who created it
  gallery?: boolean; // if true, merged link submissions appear in /gallery with voting
  config: ChallengeConfig; // discriminated by `type`
  custom?: boolean; // true if created in Organizer panel
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
  | {
      kind: "exists";
      selector: string;
      min?: number;
      label: string;
      viewport?: number;
    }
  | {
      kind: "style";
      selector: string;
      prop: string;
      matches: string;
      label: string;
      viewport?: number;
    } // regex string against computed value
  | {
      kind: "centered";
      selector: string;
      within: string;
      axis: "x" | "y" | "both";
      label: string;
      viewport?: number;
    }
  | {
      kind: "sameRow";
      selector: string;
      min: number;
      label: string;
      viewport?: number;
    } // >= min elements share the same top (±2px)
  | {
      kind: "stacked";
      selector: string;
      min: number;
      label: string;
      viewport?: number;
    } // >= min elements have distinct tops
  | {
      kind: "textIncludes";
      selector: string;
      text: string;
      label: string;
      viewport?: number;
    };

export interface Participant {
  id: string; // e.g. '24CE045'
  name: string;
  branch: "CE" | "IT" | "CSE" | "EC";
  year: 1 | 2 | 3 | 4;
  allTimeXp: number; // seed value, excludes "You"
  weeklyXp: number;
  streak: number;
}

export interface Submission {
  id: string;
  challengeId: string;
  prNumber: number; // increments from 101
  openedAt: number; // epoch ms
  payload: unknown; // code string | quiz answers | regex string | {html,css} | {url,note}
  result: { passed: boolean; scoreFraction: number; feedback: string[] };
  awardedXp: number; // Math.round(points * scoreFraction) if passed, else 0
  approvedAt?: number; // set by Organizer approval (link challenges)
  practice?: boolean; // submissions to completed challenges: no XP, no PR
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
```

### 6.2 Store shape (Zustand, persisted)

```ts
interface AppState {
  version: 1;
  profile: {
    name: string;
    id: string;
    branch: Participant["branch"];
    year: Participant["year"];
  };
  theme: "light" | "dark";
  organizerMode: boolean;
  checkouts: Record<string, { at: number; attemptsUsed: number }>; // by challengeId
  drafts: Record<string, unknown>; // by challengeId, editor content
  submissions: Submission[];
  dailyResults: DailyResult[];
  customChallenges: Challenge[];
  upvotes: Record<string, string[]>; // submissionKey -> voter ids ('you' for the current user)
  notify: Record<string, boolean>; // upcoming challenge "notify me" toggles
  activity: ActivityEntry[]; // user-generated entries only; seeds are static
  settings: { demoAutoMerge: boolean }; // default true
}
```

Not persisted: toasts, palette open state, transient UI.

### 6.3 Seed and demo user

- Seed data lives in `src/data/` and is imported as constants. Seeds are never written to storage, only user state is.
- The default profile: `{ name: 'You', id: '24CE000', branch: 'CE', year: 3 }`. The user may edit their name in a small profile modal opened from the profile chip. Store only name and id edits.
- The demo user starts with: **one merged PR** on the completed challenge `debug-broken-cart` (awarded 150 XP), a **2-day streak** created from seeded activity days, and **base XP 120** in addition to merged PRs (a constant `YOU_BASE_XP = 120`). This keeps My Progress from looking empty but leaves plenty of room to earn.
- "Reset demo" (in the overflow menu and the palette) asks for confirmation in a Modal, clears the store and reloads state to the seed defaults.

### 6.4 Safe storage wrapper (`src/lib/safeStorage.ts`)

```ts
// Implements the Zustand StateStorage interface.
// - Try window.localStorage; on ANY exception (unavailable, quota, blocked) fall back to a module-level Map.
// - getItem returns null when nothing is stored or JSON is corrupt.
// - Key: 'gitclub-arena:v1'. If the stored `version` differs from 1, discard it.
```

The store must work identically in both modes. Add a unit test for the fallback.

### 6.5 Time helpers (`src/lib/time.ts`)

- `startOfToday()` returns local midnight today (epoch ms).
- `at(dayOffset, hour = 18)` returns `startOfToday() + dayOffset * 86400000 + hour * 3600000`.
- All seed challenge dates use `at()` so the platform never looks stale on a later date.
- `formatDeadline(ts)` gives "Fri, 4 Oct · 18:00". `formatRelative(ts)` gives "in 2d 4h", "3h ago".
- `useNow(intervalMs)` hook: returns a ticking `Date.now()`; ticks every 1000ms only while a countdown or a pending PR is visible, otherwise every 30000ms.
- `dateKey(ts)` returns local `YYYY-MM-DD`.

---

## 7. Derived logic (pure functions in `src/lib/selectors.ts`, unit-tested)

### 7.1 Challenge status

```
status(c, now): now < opensAt -> 'upcoming'; now > closesAt -> 'completed'; else 'active'
```

### 7.2 PR state (never stored)

For a non-practice submission with `passed = true`:

- **Auto-judged types** (code, quiz, regex, frontend, git-terminal): elapsed = now − openedAt. `< 2s` → `open`; `2s to 5s` → `in-review`; `≥ 5s` → `merged`.
- **Link type**: `< 3s` → `open`; then `in-review` until merged. It becomes `merged` when `approvedAt` is set, OR when `settings.demoAutoMerge` is true and elapsed ≥ 20s.
- Submissions with `passed = false` never create PRs (they are failed checks, shown only as feedback and counted in attempts).
- Because state derives from timestamps, a page refresh mid-review resumes correctly.

### 7.3 XP, level, rank

- `earnedXp = YOU_BASE_XP + Σ awardedXp of merged, non-practice submissions (one per challenge: the max)` + Daily Commit XP (`20` per completed daily, `+10` bonus for a perfect score).
- Levels: **Contributor** 0, **Committer** 300, **Reviewer** 700, **Maintainer** 1300, **Core** 2200. Progress bar shows XP to next level.
- Leaderboard row for "You" uses `earnedXp` (all-time). Weekly XP for "You" is the XP from merged PRs and dailies within the last 7 days.
- League tiers (by season XP): **Bronze** < 400, **Silver** 400 to 899, **Gold** ≥ 900. Show tier badges on rows.
- Rank = position when sorting all participants plus You by XP descending (ties broken by name ascending).

### 7.4 Streak and heatmap

- A day is "active" if at least one PR merged, or one Daily Commit was completed, on that local date. Seeded history for the demo user gives days −1 and −2 as active.
- `streak` = count of consecutive active days ending today, or ending yesterday if today is not yet active (streak stays alive until the day ends).
- Heatmap: 16 weeks × 7 days grid, GitHub-style. Intensity levels 0 to 3 map to `--panel-2`, then `--success` at 35%, 65%, 100% opacity. Each cell has a `title`/tooltip "2 contributions on 12 Oct" and `aria-label`.

### 7.5 Badges (all derived)

| Badge         | Rule                                                             |
| ------------- | ---------------------------------------------------------------- |
| First Merge   | ≥ 1 merged PR in this session beyond seed, or ≥ 1 merged overall |
| Hat Trick     | ≥ 3 merged PRs                                                   |
| Regex Wizard  | Merged a regex challenge                                         |
| Pixel Perfect | Merged a frontend challenge                                      |
| Bug Squasher  | Merged a code challenge                                          |
| Early Bird    | A PR opened within 24h of the challenge opening                  |
| 3-Day Streak  | streak ≥ 3                                                       |
| 7-Day Streak  | streak ≥ 7                                                       |
| Daily Devotee | ≥ 5 Daily Commits completed                                      |
| Top 3         | Current rank ≤ 3                                                 |

Locked badges are shown dimmed with the unlock rule as text. Earning a badge triggers one toast: "Badge unlocked: Hat Trick".

### 7.6 Next Action (the signature UX feature)

`getNextAction(state, now): { id; icon; title; detail?; ctaLabel; to }`. Evaluated in this priority order. **First rule that matches wins.**

| #   | Condition                                                                                 | Title (exact template)                                                                                                      | CTA and target                                         |
| --- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------ |
| 1   | No merged PR and no checkout exists                                                       | `Start your first challenge: {easiest active challenge title}, {difficulty} · +{points} XP`                                 | "Check out" → that challenge                           |
| 2   | A checked-out active challenge has no passing submission (choose the one closing soonest) | `Resume {slug}: {attemptsLeft} attempts left` (if unlimited: `Resume {slug}: closes {relative}`)                            | "Resume" → challenge                                   |
| 3   | Any active, unsolved challenge closes within 48h (soonest)                                | `Submit by {weekday}: {title}, +{points} XP`                                                                                | "Open" → challenge                                     |
| 4   | Daily Commit not done today                                                               | `Keep your {streak}-day streak: today's Daily Commit, +20 XP` (if streak 0: `Start a streak: today's Daily Commit, +20 XP`) | "Play" → `/daily`                                      |
| 5   | XP gap to the next rank up is ≤ 100                                                       | `You're {gap} XP from rank {rank-1}`                                                                                        | "Find XP" → Arena filtered to active, sorted by points |
| 6   | A PR is open or in review                                                                 | `PR #{n} for {slug} is {open                                                                                                | in review}`                                            | "View" → challenge |
| 7   | An upcoming challenge exists                                                              | `Next unlock: {title} in {relative}`                                                                                        | "Preview" → challenge                                  |
| 8   | Otherwise                                                                                 | `You're all caught up. Check the League.`                                                                                   | "League" → `/leaderboard`                              |

Screen-specific override: on a **challenge detail** page, the bar shows a contextual action for that challenge (not checked out → "Check out to begin", checked out → attempts left and the deadline, PR open → "PR #n is in review", merged → "Merged. +{xp} XP. Next: {next action from the global list, skipping this challenge}"). On the Organizer page, the bar shows "N link PRs waiting for review" if any, else the global action.

The bar is slim (48px), one line, with a mono icon, title text, and one primary small button. Under 640px it wraps the CTA below the text only if needed. It never covers content (it is not fixed; it sits in normal flow under the sticky header and is itself sticky at `top: header height`).

### 7.7 Leaderboard ordering and animation

Recompute ranks whenever `earnedXp` changes. Use `framer-motion` `layout` on rows keyed by participant id so rows animate to their new positions. When You gain rank, show a toast "Rank up: #7 → #5", and briefly highlight your row (`--success` left border, 1.2s fade).

### 7.8 Daily Commit

- One micro-quiz per day: **3 multiple-choice questions**, drawn deterministically from a pool of at least 14 questions (git, web, JS, general CS) using `index = dayNumber % pool.length` and taking 3 consecutive (wrapping) questions. `dayNumber = floor(startOfToday()/86400000)`. Puzzle number shown as `#{dayNumber − 20000}`.
- One attempt per day. Result stored in `dailyResults`. Completing gives 20 XP (+10 if 3/3) and marks the day active for the streak.
- Share card: a bordered mono card showing `Git Club Daily Commit #N`, three squares (green filled for correct, hollow red for wrong), streak, and a "Copy result" button. Clipboard text format:
  ```
  Git Club Daily Commit #37 2/3
  🟩🟥🟩
  streak 4 · arena
  ```
  (Emoji are allowed in the clipboard text only, never as UI icons.) The Copy button needs a fallback when `navigator.clipboard` is unavailable (select text in a readonly textarea) and shows a toast on success.

### 7.9 Attempts

- `attemptsLeft = maxAttempts === null ? null : maxAttempts − checkouts[id].attemptsUsed`.
- **Run** (visible tests, or live regex checks, or preview checks) never consumes an attempt.
- **Submit** consumes one attempt (code, regex, frontend, quiz, git-terminal). Link submissions have `maxAttempts` 1 by default.
- At 0 attempts left, Submit is disabled with the text "No attempts left" and the solver panel remains viewable.

---

## 8. Challenge engine

### 8.1 Interface (`src/engine/types.ts`)

```ts
export interface CheckOutput {
  passed: boolean;
  scoreFraction: number;
  feedback: string[];
  details?: unknown;
}
export interface Engine<P> {
  run(challenge: Challenge, payload: P): Promise<CheckOutput>; // visible checks only, no attempt consumed
  submit(challenge: Challenge, payload: P): Promise<CheckOutput>; // all checks (including hidden)
}
```

One shared `useChallengeSession(challenge)` hook wires an engine to the store: it handles checkout state, drafts, attempts, creating a `Submission`, toasts, and activity log entries. Solver panels are thin UI on top of this hook. **Do not duplicate submission logic inside panels.**

Each solver panel is a lazy component chosen by `challenge.type` from a registry: `SOLVERS: Record<ChallengeType, LazyExoticComponent>`.

### 8.2 Checkout flow (all types) (F-ENG-01)

1. Before checkout, the solver area shows a locked panel: a terminal block with `$ git checkout -b challenge/{slug}` and a primary button **git checkout**. Requirements and rules are visible, but the solver is not.
2. On click: the terminal types the output over about 700ms (`Switched to a new branch 'challenge/{slug}'`), a `checkouts[id]` entry is created, an activity entry `checked-out` is added, the solver panel reveals. With reduced motion, show output instantly.
3. After checkout, a mono branch chip `⎇ challenge/{slug}` stays in the challenge header.
4. **Upcoming** challenges: no checkout. Show a countdown "Unlocks in 2d 4h", the full description (so it's not a blank page), and a "Notify me" toggle (stored in `notify`, toast "We'll remind you").
5. **Completed** challenges: description visible, a "Practice mode" checkout is allowed for auto-judged types. Practice never produces XP or PRs; results show "Practice run: 6/6 passed, no XP (challenge closed)". Link-type completed challenges are read-only.

### 8.3 Code engine (F-ENG-02) (MUST)

- Editor: CodeMirror 6, JavaScript mode, line numbers, bracket matching, indent with Tab, theme from tokens. Height about 320px, resizable is optional. Draft autosaves to `drafts[id]` (debounced 500ms).
- The challenge defines `fnName`, `starter` (a function stub with a comment), `visibleTests`, `hiddenTests`.
- **Run** executes visible tests. **Submit** executes visible + hidden tests. Pass = all tests pass. `scoreFraction` = 1 if all pass, else 0 (no partial XP).
- Execution: create a Web Worker from a Blob URL. Worker script: receives `{ code, fnName, tests }`, evaluates with `new Function(code + '\nreturn ' + fnName + ';')()`, runs each test on a `structuredClone` of the args, catches errors per test, and posts `{ results: [{ ok, actual, error?, ms }], logs: string[] }`. Capture `console.log` calls into `logs` (max 50 lines, each truncated to 200 chars).
- The main thread applies a **2000ms hard timeout for the whole run**. On timeout, terminate the worker and return a single failure: "Time limit exceeded (2s). Check for an infinite loop."
- Equality: `deepEqual(actual, expected)` (write a small function handling primitives, arrays, plain objects; treat `NaN` equal to `NaN`).
- Results UI: a checks list (like CI): `✓ merges [1,3] and [2,4]` in `--success`, `✕ empty input: expected [], got undefined` in `--danger`. Hidden tests show only as "Hidden test 2: passed/failed", with no inputs revealed. A summary line: `Checks: 4 of 6 passed`. Logs shown in a collapsible "Console" block.
- Show the last syntax error clearly (message and line if the browser provides it).
- Security note: the worker has no DOM access. The 2s timeout is the only guard. That is acceptable for a simulated platform.

### 8.4 Frontend engine (F-ENG-03) (SHOULD)

- Two CodeMirror editors as tabs, `HTML` and `CSS`, plus a live preview in an `<iframe sandbox="allow-same-origin" srcDoc={...}>` (no scripts execute; HTML/CSS only). Preview updates debounced 300ms. Buttons for preview width: Desktop (100%) / Mobile (375px).
- **Run/Submit** evaluate `config.checks` against the iframe document. Procedure per check: set the iframe width to `check.viewport ?? 800`, wait two `requestAnimationFrame`s, evaluate, then restore. Implementations:
  - `exists`: `document.querySelectorAll(selector).length >= (min ?? 1)`
  - `style`: `getComputedStyle(el)[prop]` matches `new RegExp(matches)` for the first element
  - `centered`: compare the element's bounding rect center with `within` element's center, tolerance 2px, per axis
  - `sameRow`: at least `min` matched elements have `getBoundingClientRect().top` within 2px of each other
  - `stacked`: at least `min` matched elements have distinct tops (differ by more than 8px)
  - `textIncludes`: the element's `textContent` includes the text (case-insensitive)
- Results shown as a checklist with each `label`. Pass = all checks pass. There are no hidden checks (transparency is part of the design).
- The starter HTML/CSS is loaded on first checkout. Include a "Reset to starter" button (with confirm).

### 8.5 Regex engine (F-ENG-04) (SHOULD)

- Single-line monospace input for the pattern (shown between `/` `/` slashes) and a small flags input (default empty). Two lists below: "Should match" and "Should NOT match". Each row updates **live** as the user types: green check or red cross, with the string in mono. Invalid regex shows an inline error and disables Submit.
- Matching uses `regex.test(str)` on the whole user regex (users add `^` and `$` themselves; the brief says so). Guard against catastrophic backtracking: evaluate in the same Web Worker runner with the 2s timeout.
- **Submit** additionally checks `hiddenMatch` and `hiddenReject` (shown as "Hidden: 3 of 4 passed", no strings revealed). Pass = everything passes.
- Show a character count and a "shortest wins" note only if the challenge says so. It is not required.

### 8.6 Quiz engine (F-ENG-05) (MUST)

- One question at a time with a progress indicator (`Q2 / 8`) and a **timer** (`timeLimitSec`, counting down, mono). Keyboard: 1 to 4 selects options, Enter confirms/next.
- Options are radio buttons (proper `role="radiogroup"`). After the last question, **Submit** is enabled. When the timer hits 0, auto-submit with the answers so far.
- Scoring: `correct / total`. Pass if `≥ passPercent` (default 60). `scoreFraction` = `correct/total` if passed, else 0. XP = `round(points × scoreFraction)`.
- Result screen: score, per-question review with the explanation (revealed only after submitting). If failed and attempts remain, "Try again" is offered.
- Quiz questions are shuffled per attempt (seeded by attempt number to remain stable on refresh mid-attempt).

### 8.7 Link engine (F-ENG-06) (MUST)

- Form: URL field (validated `https://` and, if `linkKinds` restricts, that the host matches: github.com, figma.com, etc.), a note textarea (max 300 chars with counter), and a checkbox "I confirm this is my own work".
- **Open pull request** creates a submission that goes `open` → `in-review` and merges when an organizer approves (or auto after 20s when demo auto-merge is on).
- A visible PR timeline under the form: Open · In review · Merged, with timestamps, the URL, and the note. States advance live via `useNow`.
- If `gallery` is true, the merged submission appears in `/gallery`.

### 8.8 Git terminal engine (F-ENG-07) (STRETCH; only after everything else is deployed)

A fake terminal with a scenario, e.g. **"Oops, wrong branch"**: initial state is `main` with 3 commits, where the last commit `add login form` should have been on `feature/login`. Goal: `main` has 2 commits, `feature/login` contains the third. Supported commands (exactly these): `git status`, `git log --oneline`, `git branch`, `git branch <name>`, `git checkout <branch>`, `git switch <branch>`, `git reset --hard HEAD~1`, `git cherry-pick <hash>`. Anything else prints `git: '<cmd>' is not supported in this simulator`. Command history with Up/Down arrows. State model: branches as `Record<string, string[]>` of commit ids plus `HEAD`. Check goal after each command. Submit becomes available when the goal is met. Include a `help` command.

---

## 9. Screens (detailed requirements)

### 9.1 Arena (`/`) (F-SCR-01) MUST

**Hero** (compact, about 200px desktop):

- Left: mono h1 `$ git checkout -b your-next-challenge` with a blinking block cursor. Beneath: one sentence for first-timers: "Weekly challenges from Git Club CHARUSAT. Solve them in your browser, open a pull request, earn XP." Two buttons: primary "Browse active challenges" (scrolls to the list), secondary "How it works" (opens a Modal with 3 steps: 1 Check out a challenge, 2 Solve it in the browser, 3 Open a pull request and earn XP).
- Right: three stat tiles (mono numbers): "Active challenges", "Participants" (seed count + 1), "XP merged this week" (sum of weekly XP). Below them a **Countdown** to the soonest deadline of an active challenge: `Closes in 1d 22h · Git Trivia Sprint`.
- **Daily Commit tile** (card): puzzle number, streak flame-like icon from lucide (not emoji), "3 questions · 20 XP", button "Play today's commit" (or "Done today: 2/3" with a Copy result button).

**Filters and tabs** (all URL-synced with `useSearchParams`, so links are shareable):
| Param | Values | Default |
|---|---|---|
| `status` | `active`, `upcoming`, `completed`, `all` | `active` |
| `cat` | category ids (multi via comma) | none |
| `diff` | `easy`, `medium`, `hard` | none |
| `type` | challenge types | none |
| `q` | free text (title, tags, category) | empty |
| `sort` | `closing`, `newest`, `points` | `closing` |

- Tabs: **Active (n)**, **Upcoming (n)**, **Completed (n)**, showing counts. Filter chips row below. Search input (debounced 200ms, `/` key focuses it when not typing elsewhere). "Clear filters" appears when any filter is set.
- Use `replace: true` for typing in search so history is not polluted.
- Invalid params fall back to defaults silently.

**Challenge card** (F-SCR-02):

- `ChallengeCover` at the top (implementing the 3D parallax pointer-tracking specified in 4.5), then title (mono), tagline, tags row (max 3 + "+n"), a meta row: category tag, difficulty dot, type tag (`code`, `quiz`, ...), `+150 XP` (mono, bold), deadline (`Closes Fri 4 Oct` / `Opens in 2d` / `Closed 4 Oct`), and a **your status** chip: `Not started`, `In progress` (checked out), `Submitted`, `Merged`. Attempts left shown as `2 attempts left` when checked out.

**your status** chip: `Not started`, `In progress` (checked out), `Submitted`, `Merged`. Attempts left shown as `2 attempts left` when checked out.

- Primary action label depends on state: `View challenge`, `Resume`, `View PR`, `Preview` (upcoming), `Review` (completed). The whole card is a link; the button is a visual affordance, not a second focus stop (avoid nested interactive elements: use one `<a>` wrapping and a non-interactive span styled as a button, or a stretched-link pattern).
- Upcoming cards show an "Unlocks in …" countdown and are visually softer (not disabled).

**Empty state:** when filters return nothing: "No branches match. Try clearing filters." plus a "Clear filters" button. **Loading:** on first mount show 6 card skeletons for ~300ms (a deliberate, short skeleton, not fake delay beyond that) while lazy chunks resolve.

**Recent activity** (commit log, below the grid, about 6 lines): `a3f9c21 · Rutvi merged "regex-roll-number" +150 XP · 2h ago`. Merge seed entries with user-generated ones, sorted by time descending. Hash = first 7 hex chars of a stable hash of the entry id.

### 9.2 Challenge detail (`/challenges/:slug`) (F-SCR-03) MUST

Layout: two columns on desktop (left 60% content, right 40% sticky solver/status), single column on mobile with the solver below the content.

- Breadcrumb in mono: `arena / challenges / {slug}`.
- Header: cover strip, title, tagline, tag row (category, difficulty, type, status pill), branch chip, `+points XP`, deadline with countdown.
- Sections: **Problem** (description), **Requirements** (checklist styled list), **Rules** (numbered list), **Tags**.
- Right column: the solver (Section 8) OR the locked/upcoming/completed variants, then a **PR timeline** if a submission exists (shows state changes live).
- Unknown slug → on-brand not-found state with a link to Arena.
- After a merge: a celebratory but restrained state: green "Merged" banner, `+150 XP` count-up, and rank change.
- "Copy link" button (toast "Link copied").

### 9.3 My Progress (`/progress`) (F-SCR-04) MUST

- Top: profile summary (name, id, branch, year), **level card** (level name, XP bar to next level, `N XP to Committer`), rank, streak (`4 days`), and tier badge.
- **Contribution heatmap** (Section 7.4).
- **Pull requests** table/list: PR number, challenge, state pill, XP, opened time; rows link to the challenge. Empty state: "No pull requests yet. Check out a challenge to open your first." with a button.
- **In progress**: checked-out challenges with no passing submission, showing attempts left and deadline.
- **Badges** grid (Section 7.5).
- **XP over time** chart (Recharts line, SHOULD): cumulative XP by day over the last 14 days from merged PRs, dailies and the base. Provide a text alternative summary for screen readers.

### 9.4 League (`/leaderboard`) (F-SCR-05) MUST

- Toggle: **This week** / **All time** (URL param `range=week|all`, default `week`).
- Podium for top 3 (compact cards), then a ranked list with: rank, name, `id · branch · yr`, tier badge, streak, XP. **Your row is highlighted and pinned**: if you are outside the visible window (top 10 shown, "Show all" expands), pin a sticky "You" row at the bottom of the list viewport.
- Row animation per Section 7.7.
- A line above the list: `Season 1 · ends in 26 days` (seed constant relative to today).
- Filter by branch or year (SHOULD): simple select controls, URL params `branch`, `year`.

### 9.5 Daily Commit (`/daily`) (F-SCR-06) SHOULD (but strongly recommended, since it drives the streak)

As in Section 7.8. One question at a time, with instant per-question feedback (green/red, with an explanation), then the share card and the streak.

### 9.6 Gallery (`/gallery`) (F-SCR-07) SHOULD

- Grid of merged submissions from `gallery: true` challenges (seed with 6 submissions for the Poster and Logo challenges from seed participants, plus the user's own when merged). Each: generated cover (no images), title, author, note, external link button, **upvote** toggle with count (mono). Upvotes are stored under `upvotes`. Sort by votes or newest. Empty state if none.

### 9.7 Organizer panel (`/organizer`) (F-SCR-08) SHOULD (high-value for the demo)

- Visible only if `organizerMode` is on. If it is off: a friendly locked state "Organizer tools are off. Turn on Organizer mode in the menu." with a toggle button. Enabling organizer mode shows a toast.
- Tabs: **New challenge**, **Review queue**, **Overview**.
- **New challenge form** (all fields validated inline, submit disabled until valid): title (auto-generates slug, editable, must be unique and kebab-case), tagline, category, difficulty, type, points (default by difficulty: 100/150/300, editable), opens at, closes at (datetime-local; closes must be after opens), max attempts, description, requirements (add/remove list), rules (add/remove list), tags (comma-separated). Type-specific section:
  - **link**: allowed link kinds (checkboxes) and prompt text.
  - **quiz**: time limit, pass %, and a question builder (prompt, 4 options, correct option, explanation), at least 3 questions.
  - **regex**: brief, and four lists (textareas, one string per line).
  - **code** and **frontend**: an "Advanced" JSON textarea prefilled with a valid template for the type, validated by parsing and shape-checking on submit, with clear errors.
  - **git-terminal**: not available in the form.
- A **live preview card** beside the form shows how the challenge card will look. "Publish challenge" adds to `customChallenges`, adds an activity entry `created`, toasts, and navigates to the new challenge. "Save as draft" is not needed.
- **Review queue**: list of link-type submissions that are `in-review` (including the user's own), with URL, note, challenge, and **Approve** / **Request changes** buttons. Approve sets `approvedAt` (PR turns merged, XP awarded, activity logged). Request changes marks the submission as `passed: false` with feedback "Changes requested by reviewer" and refunds one attempt. Empty: "Nothing to review. Queue is clean."
- **Overview**: metric tiles (challenges, active, participants, PRs merged) and a bar chart or a simple bar-style list of submissions per challenge (seed counts plus user).
- Custom challenges show a small "custom" tag in listings.

### 9.8 Command palette (F-SCR-09) MUST

- `cmdk` dialog opened by `Ctrl+K` / `⌘K` (and by the header button). Esc closes. Fully keyboard operable, focus trapped, returns focus to the trigger on close.
- Groups: **Navigate** (Arena, Daily, Progress, League, Gallery, Organizer), **Challenges** (every challenge by title, subtitle shows type and status), **Actions** (Toggle theme, Toggle organizer mode, Copy link to this page, Reset demo), **Filters** (Show active, Show upcoming, Show completed, Easy only, Hard only).
- Fuzzy search is built into cmdk. Empty state text: "No matches. Try a challenge name."
- Show shortcuts hint in the footer of the palette.

### 9.9 Global states and details

- **Toasts**: types success/error/info, auto-dismiss 4s, max 3 stacked, dismissible, `role="status"`.
- **404** route as specified in Section 5.
- **Profile modal**: edit display name and roll id (validate `^\d{2}(CE|IT|CSE|EC)\d{3}$` with a friendly error). Saving updates the leaderboard row label.

---

## 10. Seed data (exact)

Put in `src/data/participants.ts`, `challenges.ts`, `dailyPool.ts`, `activity.ts`, `gallery.ts`. All names below are fictional. Year mapping in this academic year: id prefix 23 → year 4, 24 → 3, 25 → 2, 26 → 1.

### 10.1 Participants (18)

| id       | name          | branch | year | allTimeXp | weeklyXp | streak |
| -------- | ------------- | ------ | ---- | --------- | -------- | ------ |
| 24CE045  | Rutvi Patel   | CE     | 3    | 1180      | 340      | 9      |
| 23IT012  | Harsh Solanki | IT     | 4    | 1120      | 210      | 5      |
| 24CSE031 | Dhruv Parmar  | CSE    | 3    | 1040      | 300      | 7      |
| 25CE018  | Meera Joshi   | CE     | 2    | 985       | 320      | 11     |
| 24IT027  | Kunal Trivedi | IT     | 3    | 910       | 150      | 3      |
| 23CE066  | Aarav Shah    | CE     | 4    | 860       | 180      | 4      |
| 25CSE009 | Nidhi Desai   | CSE    | 2    | 790       | 240      | 6      |
| 24EC014  | Yash Vaghela  | EC     | 3    | 720       | 120      | 2      |
| 25IT041  | Priya Chauhan | IT     | 2    | 665       | 200      | 8      |
| 26CE007  | Jay Rathod    | CE     | 1    | 540       | 260      | 5      |
| 24CE082  | Krisha Mehta  | CE     | 3    | 505       | 90       | 1      |
| 23CSE022 | Smit Bhatt    | CSE    | 4    | 470       | 70       | 0      |
| 25EC030  | Isha Panchal  | EC     | 2    | 420       | 110      | 3      |
| 26IT015  | Vansh Gohil   | IT     | 1    | 360       | 180      | 4      |
| 24CSE059 | Tanvi Modi    | CSE    | 3    | 300       | 60       | 2      |
| 26CE033  | Om Rashiya    | CE     | 1    | 240       | 140      | 3      |
| 25CE071  | Deep Makwana  | CE     | 2    | 180       | 40       | 0      |
| 26CSE004 | Ananya Dave   | CSE    | 1    | 95        | 45       | 1      |

"You" (24CE000) starts at 120 base + 150 (merged `debug-broken-cart`) = 270 all-time and 0 weekly, so you begin around rank 16 with a clear, reachable path upward. Within 2 to 3 merged challenges the user passes several people, which makes the leaderboard demo satisfying.

### 10.2 Challenges (10)

Offsets are days relative to today at 18:00 local. `maxAttempts`: code/regex/frontend 5, quiz 2, link 1.

| slug                   | title                    | type           | category        | diff   | pts | opens | closes | status today |
| ---------------------- | ------------------------ | -------------- | --------------- | ------ | --- | ----- | ------ | ------------ |
| merge-sorted-commits   | Merge Two Sorted Commits | code           | algorithms      | easy   | 100 | −3    | +4     | active       |
| center-that-div        | Center That Div          | frontend       | web-dev         | easy   | 100 | −2    | +5     | active       |
| git-trivia-sprint      | Git Trivia Sprint        | quiz           | git-tools       | easy   | 100 | −1    | +2     | active       |
| validate-roll-number   | Validate a Roll Number   | regex          | problem-solving | medium | 150 | −4    | +6     | active       |
| rebuild-landing-page   | Rebuild the Landing Page | frontend       | web-dev         | medium | 200 | −1    | +9     | active       |
| poster-for-tech-fest   | Poster for Tech Fest     | link (gallery) | design          | medium | 150 | +2    | +12    | upcoming     |
| two-sum-git-edition    | Two Sum, Git Edition     | code           | algorithms      | medium | 200 | +3    | +10    | upcoming     |
| ship-a-weekend-project | Ship a Weekend Project   | link           | open-build      | hard   | 300 | +5    | +19    | upcoming     |
| debug-broken-cart      | Debug the Broken Cart    | code           | web-dev         | medium | 150 | −14   | −4     | completed    |
| logo-redesign-sprint   | Logo Redesign Sprint     | link (gallery) | design          | easy   | 100 | −20   | −8     | completed    |

`author` for all seeds: `Git Club Core Team`. Give each challenge a realistic 2 to 3 paragraph `description` (written in the voice of a friendly club organizer, with a concrete scenario), 3 to 5 `requirements`, 3 to 4 `rules` (e.g. "Work alone", "AI tools are allowed, but you must understand your solution", "One pull request per challenge"), and 2 to 4 `tags`. Zero lorem ipsum anywhere.

#### 10.2.1 `merge-sorted-commits` (code)

Task: given two ascending arrays of commit timestamps, return one merged ascending array (do not use `.sort`).

- `fnName`: `mergeSorted`
- `starter`: `// Merge two ascending arrays into one ascending array.\n// Do not use Array.prototype.sort.\nfunction mergeSorted(a, b) {\n  // your code here\n}`
- Visible tests: `([1,3,5],[2,4,6]) → [1,2,3,4,5,6]`; `([],[1,2]) → [1,2]`; `([1,1],[1]) → [1,1,1]`
- Hidden tests: `([],[]) → []`; `([5,10],[1,2,3]) → [1,2,3,5,10]`; `([-3,0,4],[-5,-1,9]) → [-5,-3,-1,0,4,9]`

#### 10.2.2 `two-sum-git-edition` (code)

Task: given `commits` (array of line counts) and a `target`, return the indices `[i, j]` (i < j) of two commits whose line counts sum to target; return `[]` if none.

- `fnName`: `twoSum`
- Visible: `([2,7,11,15], 9) → [0,1]`; `([3,2,4], 6) → [1,2]`; `([1,2,3], 10) → []`
- Hidden: `([3,3], 6) → [0,1]`; `([-1,-2,-3,-4,-5], -8) → [2,4]`; `([0,4,3,0], 0) → [0,3]`

#### 10.2.3 `debug-broken-cart` (code, completed)

Task: `cartTotal(items)` where each item is `{price, qty, discountPercent?}` returns the total rounded to 2 decimals; the starter has three bugs (ignores qty, applies discount as absolute value, no rounding).

- Visible: `([{price:100,qty:2}]) → 200`; `([{price:50,qty:1,discountPercent:10}]) → 45`; `([]) → 0`
- Hidden: `([{price:19.99,qty:3}]) → 59.97`; `([{price:200,qty:1,discountPercent:25},{price:10,qty:5}]) → 200`

#### 10.2.4 `git-trivia-sprint` (quiz, 8 questions, 240s, pass 60%)

Write these 8 questions exactly (4 options each; the correct answer is marked `*`):

1. Which command creates a new branch and switches to it? `git branch -n` / `git checkout -b` \* / `git switch --merge` / `git new`
2. What does `git stash` do? Deletes uncommitted changes / Temporarily shelves uncommitted changes \* / Pushes to a remote / Squashes commits
3. Which file tells Git which files to ignore? `.gitkeep` / `.gitignore` \* / `.gitconfig` / `.ignore.json`
4. What does `git pull` do? `fetch` only / `fetch` then `merge` (or rebase) \* / `push` then `fetch` / `clone` again
5. Which command shows the commit history in one line per commit? `git log --oneline` \* / `git history -s` / `git show --short` / `git reflog --one`
6. What is HEAD? The first commit / A pointer to the current commit or branch \* / The remote's default branch / The staging area
7. Which command undoes the last commit but keeps the changes staged? `git reset --hard HEAD~1` / `git reset --soft HEAD~1` \* / `git revert --hard` / `git checkout HEAD~1`
8. What is a pull request? A command that downloads code / A request to review and merge changes into another branch \* / A way to delete branches / A type of merge conflict

Each needs a one-sentence `explanation`.

#### 10.2.5 `validate-roll-number` (regex)

Brief: "Write one regex that accepts valid CHARUSAT-style roll numbers: 2 digits for the admission year, a branch code (`CE`, `IT`, `CSE` or `EC`), then exactly 3 digits. Uppercase only. Anchor your pattern."

- Reference answer (do not display): `^\d{2}(CE|IT|CSE|EC)\d{3}$`
- `shouldMatch`: `24CE045`, `23IT012`, `25CSE009`, `26EC101`
- `shouldReject`: `24ce045`, `24ME045`, `24CE45`, `2CE045`
- `hiddenMatch`: `22CSE999`, `24IT000`
- `hiddenReject`: `24CE0450`, ` 24CE045`, `24CEE045`, `24CE04A`

#### 10.2.6 `center-that-div` (frontend)

- `starterHtml`: `<div class="stage">\n  <div class="box">Center me</div>\n</div>`
- `starterCss`: `.stage { width: 100%; height: 320px; background: #192320; }\n.box { width: 120px; height: 120px; background: #F05133; color: #0B0F0E; font-family: monospace; }`
- Checks: exists `.stage` "Has a .stage container"; exists `.box` "Has a .box element"; centered `.box` within `.stage` axis `x` "Box is centered horizontally"; centered `.box` within `.stage` axis `y` "Box is centered vertically"; style `.box` `width` matches `^120px$` "Box is still 120px wide".

#### 10.2.7 `rebuild-landing-page` (frontend)

Brief: turn an unstyled skeleton into a proper landing page. Starter HTML is a semantic skeleton: `header` with `nav` containing 4 links, `main` with `section.hero` (h1, p, `a.cta`), `section.features` with three `.card` (h3, p each), and `footer`. Starter CSS is nearly empty.

- Checks: exists `nav a` min 4 "Navigation has 4 links"; exists `h1` "Hero has a heading"; style `.cta` `background-color` matches `^(?!rgba\(0, 0, 0, 0\)).*$` "CTA button has a background color"; style `.cta` `border-radius` matches `^([1-9]\d*(\.\d+)?px|.*%)$` "CTA has rounded corners"; sameRow `.card` min 3 at viewport 900 "Three feature cards sit in a row on desktop"; stacked `.card` min 3 at viewport 375 "Cards stack on mobile"; style `body` `font-family` matches `.+` "Body font is set"; style `footer` `text-align` matches `^center$` "Footer text is centered".

#### 10.2.8 Link challenges

- `poster-for-tech-fest`: prompt "Share a link (Figma, Drive or an image host) to your poster for the CHARUSAT Tech Fest. Add one line on your design idea." `linkKinds`: figma, drive, other. `gallery: true`.
- `ship-a-weekend-project`: prompt "Ship something small over the weekend and share the GitHub repo and the live demo URL in the note." `linkKinds`: github. Rules require a README.
- `logo-redesign-sprint`: completed, `gallery: true`; description about redesigning the Git Club logo.

### 10.3 Daily Commit pool

Author **at least 14** verified multiple-choice questions (git, HTML/CSS, JavaScript, general CS, 4 options each, one correct, one-sentence explanation). Use the `QuizQuestion` type. Double-check every answer before committing. Wrong answer keys are a credibility risk.

### 10.4 Seed activity (commit log)

Create 12 entries with actors from the participants list and `at` = `now − N hours` computed at load (e.g. 25 min, 1h, 2h, 3h, 5h, 8h, 12h, 20h, 26h, 30h, 40h, 50h), verbs mostly `merged` (with XP) and some `opened` or `checked-out`, on the active challenges plus a few on completed ones.

### 10.5 Gallery seed

6 entries across `logo-redesign-sprint` (4) and `poster-for-tech-fest` (2, but that challenge is upcoming, so use only entries for `logo-redesign-sprint`: seed 6 there). Each has author (participant), a one-line note, an `https://` link (use `https://figma.com/` style placeholder links that are visibly fine, e.g. `https://www.figma.com/`), and a seed vote count between 3 and 21.

### 10.6 Seed user history

- `submissions`: one merged submission for `debug-broken-cart` with `openedAt = at(-6)`, `awardedXp 150`, `prNumber 100`, `result.passed true`.
- Streak: activity on days −1 and −2 (two synthetic heatmap entries), plus a scattered handful of earlier days in the last 12 weeks so the heatmap looks lived-in. These history entries come from a constant `SEED_HEATMAP_OFFSETS`.

---

## 11. Accessibility (F-A11Y) MUST

- All interactive elements are reachable and operable by keyboard, with a **visible focus ring** (2px outline `--accent`, 2px offset) on every focusable element.
- `Esc` closes any modal or palette; modals trap focus and restore it on close.
- Tabs use `role="tablist"`, arrow-key navigation. Toggles use `aria-pressed`. Live regions for toasts, quiz timer warnings (announce at 30s and 10s), and rank changes.
- Landmarks: `header`, `nav`, `main`, `footer`. One `h1` per route. Logical heading order.
- Skip link "Skip to content" as the first focusable element.
- Contrast AA in both themes. Don't rely on color alone (Section 4.4).
- Respect `prefers-reduced-motion`.
- Form fields always have visible labels, with error text linked via `aria-describedby`.
- Tap targets ≥ 44×44px on touch.

## 12. Performance, SEO, and meta (F-PERF, F-SEO)

- Route-level code splitting. CodeMirror and Recharts load only on routes that need them. Fonts subsetted to Latin.
- `index.html`: `<title>`, meta description, `theme-color`, favicon (SVG git-branch glyph in `--accent`), `og:title`, `og:description`, `og:type`, `og:image` (`/og.png`, 1200×630, generated once: dark background, wordmark, tagline), `twitter:card=summary_large_image`. Also `public/robots.txt` (allow all).
- No console errors or warnings in production build. No layout shift on load (reserve heights for the hero, cards, and skeletons).
- Lighthouse targets in Section 3, measured on the deployed URL.

## 13. Responsive behavior (F-RESP) MUST

- Breakpoints: 640, 768, 1024, 1280.
- Arena grid: 1 col (<640), 2 cols (640 to 1023), 3 cols (≥1024).
- Challenge detail: single column below 1024; two columns at ≥1024 with a sticky solver column.
- Editors and the terminal never cause horizontal page scroll: wide content scrolls inside its own `overflow-x: auto` container.
- Header collapses nav into the bottom tab bar below 768px. The profile chip shows only initials on mobile.
- Test on a real phone. The quiz, the regex input, and the command palette must all be usable on mobile. Use `inputMode`, `autoCapitalize="off"`, and `spellCheck={false}` on code-ish inputs.

## 14. Repository structure

```
/
├─ SPEC.md
├─ README.md            (what it is, how to run, design decisions, what's simulated)
├─ vercel.json
├─ index.html
├─ public/  favicon.svg, og.png, robots.txt
└─ src/
   ├─ main.tsx, App.tsx, routes.tsx, index.css (tokens + tailwind layers)
   ├─ types.ts
   ├─ store/           useStore.ts, safeStorage.ts
   ├─ lib/             time.ts, selectors.ts, nextAction.ts, xp.ts, badges.ts, hash.ts, prng.ts, cn.ts
   ├─ engine/          types.ts, useChallengeSession.ts, codeRunner.worker.ts (or blob factory),
   │                   codeEngine.ts, regexEngine.ts, quizEngine.ts, frontendEngine.ts, linkEngine.ts, gitTerminal/*
   ├─ data/            participants.ts, challenges.ts, dailyPool.ts, activity.ts, gallery.ts
   ├─ components/      ui/*, layout/* (Header, NextActionBar, StatusLine, TabBar), challenge/*, solvers/*
   ├─ pages/           Arena, ChallengeDetail, Progress, Leaderboard, Daily, Gallery, Organizer, NotFound
   └─ hooks/           usePageTitle, useNow, useHotkey, useReducedMotion
```

## 15. Build order and acceptance criteria

Build in vertical slices. After each slice: run `npm run build` (must pass with zero TypeScript errors), start the app, click through what you built, fix visual inconsistencies, then commit.

| Phase  | Deliverable                                                                                                                                | Acceptance (all must be true)                                                                                                                     |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0     | Scaffold, tokens, theme toggle, fonts, router, layout shell (header, next-action bar placeholder, status line, mobile tab bar), safe store | Both themes render with exact tokens; theme persists (or falls back cleanly); 404 route works; deep link reload works locally with `vite preview` |
| P1     | Types, seed data, selectors (status, PR state, XP, streak, rank, next action) with unit tests                                              | `vitest` passes; selectors are pure; all seeded challenges show the expected status today                                                         |
| P2     | Arena page: hero, tabs, URL-synced filters, cards, covers, empty/skeleton states, activity feed                                            | Filters change the URL and survive reload; copying the URL into a new tab reproduces the view; cards show all required fields                     |
| P3     | Challenge detail shell + checkout flow + PR timeline + Quiz engine + Link engine                                                           | Full loop works: checkout → attempt → PR moves Open → In review → Merged live → XP updates                                                        |
| P4     | Code engine (worker, timeout, results UI)                                                                                                  | Infinite loop returns the timeout message in ≤ 2.5s and the page stays responsive; hidden tests never reveal inputs; drafts persist               |
| P5     | Leaderboard with animation, My Progress (level bar, heatmap, badges, PR list), Next Action bar wired to every rule                         | Earning XP re-ranks live; each Next Action rule can be reproduced by manipulating state; bar changes on a challenge page as specified             |
| P6     | Regex + Frontend engines, Daily Commit with share card                                                                                     | Regex rows update live; frontend checks pass with a correct solution and fail with the starter; clipboard works with fallback                     |
| P7     | Command palette, toasts polish, Reset demo, profile modal, a11y pass, mobile pass                                                          | All items in Section 11 pass; palette works fully by keyboard                                                                                     |
| **P8** | **Deploy to Vercel now.** Incognito test, real phone test, Lighthouse                                                                      | Live URL works cold; no console errors; scores at target. Fix regressions before adding anything                                                  |
| P9     | Organizer panel (form, review queue, overview) + Gallery                                                                                   | Creating a challenge in the form makes it appear in the Arena and openable; approving a link PR merges it                                         |
| P10    | STRETCH: git-terminal challenge, extra polish                                                                                              | Only if P0 to P9 are deployed and stable                                                                                                          |

If time is short, **cut in this order**: git-terminal, gallery voting, Recharts XP chart, branch/year leaderboard filters, frontend engine "stacked" checks. Never cut deployment (P8) or the demo recording time.

## 16. Global definition of done

- [ ] Live URL opens in incognito with no local files, and all routes work on reload.
- [ ] Every requirement in the hackathon brief is visibly satisfied: challenge listing, cards (title, category, difficulty, deadline, points), detail page (description, requirements, rules, submission action), submission flow, leaderboard, participant progress/status, clear active/upcoming/completed distinction, responsive.
- [ ] No dead buttons, no lorem ipsum, no broken images, no console errors.
- [ ] Both themes look intentional. Keyboard-only use of the whole main journey is possible.
- [ ] Verified on a real phone.
- [ ] `README.md` documents: the concept, what is simulated, design tokens, the engine interface, and how to add a challenge type.

## 17. Rules for the agent (behavioral)

1. Read this whole file before writing code. Ask at most one clarifying question, and only if truly blocked. Otherwise pick the option that best matches this spec and note the assumption in your summary.
2. Work one phase at a time. Do not start the next phase until the current phase's acceptance criteria pass.
3. Never add features outside the spec. Never remove spec features silently. If you cannot deliver something, say so plainly.
4. Use the tokens exactly. Do not introduce gradients, purple, emoji icons, or new fonts.
5. Keep logic out of components: engines, selectors and the store hold logic. Components render.
6. Keep every derived value derived (Section 7). Do not add stored fields that duplicate derived ones.
7. After each phase, output: what was built, how to verify it (exact clicks), known gaps, and the next phase.
8. Prefer small files and clear names. TypeScript strict. No `any` unless commented with a reason.
9. Do not fabricate data at render time (no `Math.random` in render). Use the seeded PRNG for anything visual.
10. When in doubt about taste, choose the calmer, clearer, more consistent option.
