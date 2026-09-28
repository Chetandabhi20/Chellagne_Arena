# MASTER_PROMPT.md: Git Club Challenge Arena

How to use this file:

1. Put `SPEC.md` in the root of an empty project folder (or attach it in your agent tool).
2. Paste **Part A** once, as the first message (or into the agent's system/rules file, e.g. `CLAUDE.md`, `AGENTS.md`, or `.cursorrules`).
3. Then paste the **Part B** phase prompts one at a time. Test each phase before sending the next.
4. Use **Part C** when something goes wrong.

---

## Part A: Master prompt (paste first)

```
You are a senior product engineer and designer building "Git Club Challenge Arena", a
hackathon entry that must beat 150+ other submissions on a 7-hour clock.

SOURCE OF TRUTH
Read /SPEC.md completely before doing anything. It contains the product definition, design
tokens, data model, derived-logic rules, challenge engine interface, every screen, exact seed
data, acceptance criteria, and build order. Follow it literally. If this message and SPEC.md
disagree, SPEC.md wins.

WHAT WE ARE BUILDING (short version)
A no-backend web platform where students pick a challenge, "git checkout" it, solve it in the
browser (code with tests, quiz, regex, HTML/CSS with a live preview, or a link submission),
open a "pull request" for their score (Open -> In review -> Merged), earn XP, and climb a
league. A "Next Action" bar on every screen always tells the participant what to do next.
An Organizer panel lets the club create challenges and review submissions. Everything is
simulated in the browser and persisted safely so progress survives refresh.

STACK (fixed)
Vite + React 18 + TypeScript strict + Tailwind (tokens as CSS variables) + React Router v6 +
Zustand (persist with a try/catch safe-storage wrapper and in-memory fallback) + cmdk +
framer-motion + CodeMirror 6 + Recharts (only for one chart) + lucide-react + Vitest.
Do not add other dependencies without asking me first.

NON-NEGOTIABLE DESIGN RULES
- Use the exact color tokens, fonts (JetBrains Mono + Inter), radius (8px) from SPEC.md Section 4.
- FORBIDDEN: gradients, purple/indigo accents, glassmorphism, emoji as UI icons, stock
  illustrations, big shadows, "modern SaaS template" layouts, lorem ipsum.
- Challenge covers are generated SVG git-graphs from a seeded PRNG. No image files.
- Every status has a text label AND an icon (never color alone).
- Both dark and light themes must look intentional and pass AA contrast.

NON-NEGOTIABLE ENGINEERING RULES
- Derived values (challenge status, PR state, XP, level, rank, streak, badges, next action)
  are computed by pure, unit-tested functions from stored state. Never store them.
- No localStorage access outside src/store/safeStorage.ts. The app must work with storage
  blocked or empty.
- No Math.random in render paths. No console errors. No dead buttons.
- All challenge types run through ONE engine interface and ONE useChallengeSession hook.
  Solver panels are thin UI. Do not duplicate submission logic.
- User code runs only inside a Web Worker with a 2 second hard timeout.
- Seed dates are computed relative to today via helper functions so the app never looks stale.
- Lazy-load heavy routes (challenge detail solvers, Organizer, Gallery, Recharts, CodeMirror).

HOW TO WORK
- Work in the phases defined in SPEC.md Section 15 (P0 to P10). I will tell you which phase
  to do. Do only that phase.
- Before coding a phase: list the files you will create/change in one short list.
- After coding a phase: run `npm run build` and `npm run test`, fix all errors, then reply with:
  (1) what you built, (2) exactly how I can verify it (the clicks to make), (3) assumptions
  you made, (4) known gaps, (5) the next phase.
- Ask at most ONE clarifying question, and only if you are truly blocked. Otherwise choose the
  option that best matches SPEC.md and state the assumption.
- Never silently drop a spec feature. If something cannot be done, say so.
- Keep files small, names clear, TypeScript strict, no `any` without a comment explaining why.

Acknowledge by replying with a 10-line summary of the product in your own words and a list of
the phases. Do not write code yet.
```

---

## Part B: Phase prompts (paste one at a time)

### P0: Scaffold, tokens, shell

```
Do Phase P0 from SPEC.md Section 15.

- Scaffold Vite + React + TS + Tailwind. Install only the dependencies listed in the master prompt.
- Self-host fonts with @fontsource/jetbrains-mono (400, 500, 700) and @fontsource/inter (400, 500, 600).
- Implement the exact color tokens for dark and light themes (Section 4.2) as CSS variables and
  map them in tailwind.config. Add the inline no-flash theme script to index.html (try/catch).
- Build the layout shell: sticky Header (wordmark "git-club / arena" with a branch glyph SVG,
  nav, Ctrl+K button placeholder, theme toggle, profile chip placeholder, overflow menu
  placeholder), NextActionBar placeholder (48px slim bar under the header), footer StatusLine,
  and the mobile bottom TabBar (<768px). Add a "Skip to content" link.
- Implement routes with placeholder pages for every route in Section 5 plus the on-brand 404
  (`fatal: pathspec '<path>' did not match any files`).
- Implement usePageTitle, useNow, useHotkey, useReducedMotion hooks.
- Implement src/store/safeStorage.ts and src/store/useStore.ts with the state shape from
  Section 6.2 (actions can be stubs for now), persist key 'gitclub-arena:v1', version check.
  Add a Vitest test proving the in-memory fallback works when localStorage throws.
- Build the global UI primitives listed in Section 4.7 (Button, Tag, StatusPill, DifficultyDot,
  Card, Tabs, Modal with focus trap, Toast system, Skeleton, EmptyState, ProgressBar, CountUp,
  Countdown, Kbd, CommitLine, ChallengeCover using a seeded PRNG).
- Add vercel.json with the SPA rewrite and favicon.svg.

Acceptance: see P0 row in Section 15. Show me a temporary /dev route that renders every UI
primitive in both themes so I can review the look before we continue.
```

### P1: Types, data, pure logic

```
Do Phase P1 from SPEC.md Section 15.

- Create src/types.ts exactly as in Section 6.1.
- Create src/lib/time.ts (Section 6.5).
- Create the seed data files under src/data/ exactly per Section 10: 18 participants, 10
  challenges (with the exact code tests, quiz questions, regex lists, and frontend checks
  given in 10.2.x), the Daily Commit pool (at least 14 questions, you author them and
  double check every answer key), 12 seed activity entries, 6 gallery seeds.
- Write challenge descriptions, requirements, rules and tags in a friendly organizer voice:
  2 to 3 paragraphs of concrete scenario each. No lorem ipsum.
- Create src/lib/selectors.ts, nextAction.ts, xp.ts, badges.ts implementing Section 7
  (status, PR state, XP/levels/rank/tiers, streak/heatmap, badges, attempts, next action with
  the 8 prioritized rules, and daily pick).
- Write Vitest tests covering: challenge status boundaries, PR state timing for auto-judged
  and link submissions (including demo auto-merge), XP and level thresholds, streak
  (today inactive but yesterday active), rank tie-breaking, each of the 8 next-action rules
  plus the challenge-page override, daily pick determinism, and the reference regex against
  the regex challenge lists.
- Verify with a test that every seeded code challenge's reference solution passes its tests
  (write reference solutions in the test file, not in the app bundle).

Acceptance: see P1 row. Output a table of today's seeded challenge statuses so I can check it.
```

### P2: Arena page

```
Do Phase P2 from SPEC.md Section 15, implementing Section 9.1 fully.

Hero with cursor-blink h1, first-timer sentence, "How it works" modal, stat tiles, countdown
to the soonest deadline, Daily Commit tile. Tabs (Active/Upcoming/Completed with counts) and
filters (cat, diff, type, q, sort) all synced to URL params with the exact names and defaults
in the table. Challenge cards per Section 9.1 (cover, title, tagline, tags, meta, XP,
deadline, YOUR-status chip, attempts left, context-aware action label) using a stretched-link
pattern with no nested interactive elements. Empty state, 300ms skeleton, and the commit-log
activity feed. Press "/" to focus search. Wire the profile chip to open the profile modal
(edit name and roll id with validation).

Then wire the real NextActionBar to getNextAction() so it renders on every route.

Acceptance: see P2 row. Show me 3 example URLs I can paste to verify shareable filters.
```

### P3: Detail page, checkout, Quiz + Link engines

```
Do Phase P3 from SPEC.md Section 15.

Build the challenge detail page (Section 9.2), the engine interface and useChallengeSession
hook (Section 8.1), the checkout flow with terminal typing animation (8.2, including the
upcoming and completed/practice variants), the PR timeline that advances live with useNow
(7.2), the Quiz engine (8.6) and the Link engine (8.7). Solver panels are lazy-loaded via a
registry keyed by challenge type. Implement toasts for merged PRs, attempts consumed, and
rank/badge changes (rank/badge can be stubbed until P5). Add the contextual NextActionBar
override on the detail page.

Acceptance: see P3 row. Walk me through: check out git-trivia-sprint, fail once, retry, pass,
and watch the PR go Open -> In review -> Merged while the XP count-up runs.
```

### P4: Code engine

```
Do Phase P4 from SPEC.md Section 15 (Section 8.3 in full).

CodeMirror 6 editor themed from tokens, draft autosave, Run vs Submit semantics, Web Worker
runner built from a Blob, structuredClone of args, per-test error capture, console.log
capture, 2s whole-run timeout with worker termination, deepEqual, CI-style results list,
hidden tests that never reveal inputs, syntax error display. Add Vitest tests for deepEqual
and for the runner's timeout behaviour if it can be tested in the environment (otherwise
document a manual test). Make sure the CodeMirror bundle is only loaded on challenge detail.

Acceptance: see P4 row. Prove it with: an infinite loop submission, a syntax error, a thrown
exception, a correct solution, and a solution that passes visible tests but fails a hidden one.
```

### P5: Leaderboard, Progress, Next Action, badges

```
Do Phase P5 from SPEC.md Section 15 (Sections 9.3, 9.4, 7.3 to 7.7).

League page with week/all-time toggle in the URL, podium, ranked list, pinned "You" row,
tier badges, framer-motion layout animation on re-rank (respect reduced motion), rank-up
toast, branch/year filters if quick. My Progress: profile summary, level card with XP bar,
16-week contribution heatmap with tooltips and aria-labels, PR list with empty state,
in-progress list, badge grid with locked rules, and the Recharts XP chart (lazy-loaded) with
a screen-reader summary. Emit a single toast when a new badge unlocks.

Acceptance: see P5 row. Show me how to reproduce each of the 8 Next Action states.
```

### P6: Regex, Frontend engines, Daily Commit

```
Do Phase P6 from SPEC.md Section 15 (Sections 8.4, 8.5, 7.8, 9.5).

Regex solver with live green/red rows, invalid-pattern handling, worker-based evaluation with
timeout, hidden checks summary. Frontend solver with HTML/CSS CodeMirror tabs, sandboxed
iframe preview (sandbox="allow-same-origin", srcDoc), desktop/mobile preview toggle, check
runner exactly as specified (viewport resizing with two rAFs), starter reset with confirm.
Daily Commit page: deterministic 3-question pick, instant feedback, one attempt per day,
XP and streak effects, Wordle-style share card with copy (with clipboard fallback).

Acceptance: see P6 row. Prove the frontend checks fail on the starter and pass on a correct
solution for both frontend challenges (write the two correct solutions into your test notes).
```

### P7: Palette, polish, accessibility, mobile

```
Do Phase P7 from SPEC.md Section 15.

Command palette with cmdk (Section 9.8): Navigate, Challenges, Actions, Filters groups, Ctrl/Cmd+K,
Esc, focus return. Reset demo (with confirm modal), Organizer mode toggle, copy link action.
Then do a full pass on Section 11 (accessibility), Section 13 (responsive) and Section 12
(SEO/meta: per-route titles, meta tags, og:image at /og.png, robots.txt). Generate og.png
(1200x630) with a small script or an SVG-to-PNG step and commit it in /public.

Give me a manual QA checklist I can run on my phone (tap targets, palette, quiz, regex input,
no horizontal scroll) and list any contrast values you had to adjust.
```

### P8: Deploy gate (do this before P9)

```
Prepare for deployment.

Run `npm run build` and `npm run preview`, and fix every warning. Verify vercel.json rewrites
by loading a deep link (/challenges/center-that-div) directly after a hard refresh in preview.
Write the README.md (concept, what is simulated, tokens, engine interface, how to add a new
challenge type, keyboard shortcuts). Give me exact Vercel deployment steps (import repo,
framework preset Vite, build command, output dir dist). After I deploy, I will report
Lighthouse scores and any issues.
```

### P9: Organizer + Gallery

```
Do Phase P9 from SPEC.md Section 15 (Sections 9.7 and 9.6).

Organizer panel behind the Organizer-mode toggle: new challenge form with full validation,
type-specific editors (link, quiz, regex fully; code and frontend via validated JSON
templates), unique kebab-case slug, live preview card, publish to customChallenges, activity
entry, toast, navigate to the new challenge. Review queue with Approve and Request changes
(refund an attempt). Overview tab with metric tiles and a submissions-per-challenge bar list.
Gallery page with seeded submissions, upvote toggles persisted in the store, and sort.

Acceptance: see P9 row. I will demo: turn on organizer mode, create a quiz challenge with 3
questions, see it appear in the Arena as "custom", solve it, and approve a link PR.
```

### P10 (STRETCH): Git terminal challenge

```
Only if P0 to P9 are deployed and stable. Implement Section 8.7 (git-terminal engine) with the
"Oops, wrong branch" scenario, the exact 8 supported commands plus `help`, command history
with Up/Down, goal detection, and add one seeded upcoming challenge "Undo the Damage" that
uses it (hard, 300 XP). Add unit tests for the git state machine.
```

---

## Part C: Repair prompts (use when needed)

**Visual drift / generic look**

```
The UI is drifting from SPEC.md Section 4. Audit every page against the tokens, fonts, radius,
and the FORBIDDEN list (gradients, purple, emoji icons, big shadows). List each violation with
file and line, then fix them all. Do not change behavior.
```

**Derived-state bug**

```
Something is inconsistent (describe it). Find the source of truth in SPEC.md Section 7, check
whether any derived value is being stored or duplicated, and fix it by computing from state.
Add a Vitest test that reproduces the bug first.
```

**Performance**

```
Lighthouse Performance on the home page is below 90. Analyze the bundle (vite-bundle-visualizer
or rollup output), ensure CodeMirror, Recharts and framer-motion features are only loaded on
routes that need them, add preloading only where it helps, reserve layout space to avoid
layout shift, and report before/after scores.
```

**Accessibility**

```
Run a keyboard-only pass over the main journey (Arena -> filter -> open challenge -> checkout
-> submit -> progress -> league -> palette). Fix any missing focus rings, unreachable controls,
focus traps that leak, missing labels, and heading order issues. List what you changed.
```

**Agent got confused or wandered off**

```
Stop. Re-read /SPEC.md Sections 1, 7 and 17 and the current phase in Section 15. Summarize in
5 bullets what the current phase requires, list what is already done and what is missing,
then continue with only the missing items.
```

---

## Part D: Human checklist (your job, not the agent's)

- **Before you start (10 min):** create the GitHub repo, connect it to Vercel, put `SPEC.md` in the repo.
- **After every phase:** click through it yourself for 2 minutes. Fixing early is cheaper than fixing late.
- **Deploy at P8**, not at the end. Keep deploying after P9.
- **Test on your real phone** after P7 and again after P9.
- **Record the video** in the last 45 minutes, using the script from the plan. Create a fresh demo state first with "Reset demo".
- **Video file name:** `ID_Name_phonenumber` (e.g. `24CS084_Om_Rashiya_9876543210`). Check the Drive link in incognito.
- **Seed check:** open the site at least once on a different day or with a shifted system clock to confirm the relative dates still produce active, upcoming and completed challenges.
