# Git Club Challenge Arena

## Concept
Git Club Arena is a challenge platform designed for the Git Club at CHARUSAT. It allows participants to pick a challenge, "git checkout" it, solve it directly in the browser, open a pull request for their score, and climb a season league leaderboard. It is designed to be a fast, responsive, and purely client-side application.

## What is Simulated
This application runs entirely in the browser without a backend. The following aspects are simulated:
- **Authentication**: There is no real login. The user plays as a pre-seeded participant, and their local progress is saved to `localStorage` (falling back to memory if blocked).
- **Competitors**: Leaderboard data, activity feeds, and other participants' progress are pre-seeded and deterministic.
- **Code Execution**: Code challenges are run in a local Web Worker with a hard timeout of 2 seconds to prevent infinite loops from hanging the browser.
- **Pull Requests & Code Reviews**: The process of opening a PR, having it reviewed, and merging it is simulated with UI state transitions.
- **Organizer Mode**: Admin privileges are toggled via the UI to demonstrate how challenges can be created and reviewed. Custom challenges created in Organizer mode are saved locally.

## Design Tokens
The application strictly follows a defined set of design tokens (CSS variables) to maintain a cohesive, "git-inspired" aesthetic:
- **Dark Theme (Default)**: `--bg: #0B0F0E`, `--panel: #131A17`, `--panel-2: #192320`, `--border: #22302A`, `--text: #E6EDE8`, `--muted: #8A9A92`, `--accent: #F05133`, `--success: #3DDC97`, `--warning: #FFB020`, `--danger: #FF5C5C`
- **Light Theme**: `--bg: #F6F4EE`, `--panel: #FFFFFF`, `--panel-2: #EFECE3`, `--border: #DDD8CB`, `--text: #16201B`, `--muted: #5C6B63`, `--accent: #D63E22`, `--success: #127A4E`, `--warning: #9A6400`, `--danger: #C62F2F`
- **Typography**: JetBrains Mono for monospace (headings, buttons, tags), Inter for standard body text.
- **Other**: Border radius is strictly 8px for most components, and borders are always 1px solid using `--border`.

## Engine Interface
All challenges run through a unified engine interface, regardless of type.
- `useChallengeSession(slug)` hook manages the current state of a challenge attempt.
- Engines (e.g., `codeEngine`, `quizEngine`, `regexEngine`) are pure functions or async worker calls that take a user's submission and the challenge data, and return a `SubmissionResult` object: `{ passed: boolean; feedback: string }`.
- Code execution specifically is handled by `codeRunner.worker.ts` to ensure safety and prevent UI blocking.

## How to Add a New Challenge Type
To add a new challenge type:
1.  **Update Types**: Add the new type to the `ChallengeType` union in `src/types.ts`.
2.  **Create an Engine**: Create a new file in `src/engine/` (e.g., `newEngine.ts`). This should export a function that takes the challenge definition and the user's answer, and returns a `Promise<{passed: boolean, feedback: string}>`.
3.  **Update Solver UI**: Create a new component in `src/components/solvers/` (e.g., `NewSolver.tsx`) that provides the UI for the user to input their answer.
4.  **Integrate**: Update `src/pages/ChallengeDetail.tsx` to render your new solver component when the challenge type matches, and pass the user's input to your new engine when they submit.

## Keyboard Shortcuts
- **Command Palette**: `Ctrl+K` (or `⌘K` on Mac) opens the command palette for quick navigation and actions.
- **Navigation**: `Esc` closes modals, dropdowns, and the command palette.
- **Accessibility**: Full keyboard navigation (Tab/Shift+Tab) is supported across all interactive elements, complete with visible focus rings.
