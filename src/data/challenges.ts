import type { Challenge } from '../types';
import { at } from '../lib/time';

/**
 * All 10 seed challenges. Dates use `at(dayOffset)` so the app never looks stale.
 * Offsets are days relative to today at 18:00 local.
 */
export const challenges: Challenge[] = [
  // ── Active challenges ──────────────────────────────────────────────
  {
    id: 'merge-sorted-commits',
    slug: 'merge-sorted-commits',
    title: 'Merge Two Sorted Commits',
    tagline: 'Combine two sorted commit-timestamp arrays into one — without .sort().',
    category: 'algorithms',
    difficulty: 'easy',
    type: 'code',
    points: 100,
    opensAt: new Date(at(-3)).toISOString(),
    closesAt: new Date(at(4)).toISOString(),
    maxAttempts: 5,
    description:
      `You're building an internal tool that merges two branches of commit timestamps ` +
      `into a single chronological feed. Each branch already has its commits in ascending ` +
      `order, so your job is to weave them together efficiently without resorting to a ` +
      `built-in sort.\n\n` +
      `Think of the classic merge step in merge-sort: walk both arrays with two pointers, ` +
      `always picking the smaller element. Handle edge cases like empty arrays and ` +
      `duplicate timestamps gracefully.\n\n` +
      `This is a warm-up challenge — a great first checkout if you're new to the Arena.`,
    requirements: [
      'Return a single ascending array containing all elements from both inputs.',
      'Do not use Array.prototype.sort or any built-in sort method.',
      'Handle empty arrays and duplicate values correctly.',
    ],
    rules: [
      'Work alone.',
      'AI tools are allowed, but you must understand your solution.',
      'One pull request per challenge.',
    ],
    tags: ['javascript', 'arrays', 'two-pointers'],
    author: 'Git Club Core Team',
    config: {
      type: 'code',
      fnName: 'mergeSorted',
      starter:
        '// Merge two ascending arrays into one ascending array.\n' +
        '// Do not use Array.prototype.sort.\n' +
        'function mergeSorted(a, b) {\n' +
        '  // your code here\n' +
        '}',
      visibleTests: [
        { args: [[1, 3, 5], [2, 4, 6]], expected: [1, 2, 3, 4, 5, 6], label: 'merges [1,3,5] and [2,4,6]' },
        { args: [[], [1, 2]], expected: [1, 2], label: 'empty first array' },
        { args: [[1, 1], [1]], expected: [1, 1, 1], label: 'duplicate values' },
      ],
      hiddenTests: [
        { args: [[], []], expected: [], label: 'both empty' },
        { args: [[5, 10], [1, 2, 3]], expected: [1, 2, 3, 5, 10], label: 'different lengths' },
        { args: [[-3, 0, 4], [-5, -1, 9]], expected: [-5, -3, -1, 0, 4, 9], label: 'negative numbers' },
      ],
    },
  },

  {
    id: 'center-that-div',
    slug: 'center-that-div',
    title: 'Center That Div',
    tagline: 'The eternal frontend quest: center a box inside its container.',
    category: 'web-dev',
    difficulty: 'easy',
    type: 'frontend',
    points: 100,
    opensAt: new Date(at(-2)).toISOString(),
    closesAt: new Date(at(5)).toISOString(),
    maxAttempts: 5,
    description:
      `Every frontend developer has faced the ultimate question: how do you center a ` +
      `div? In this challenge, you get a stage container and a box inside it. Your task ` +
      `is to center the box both horizontally and vertically using only CSS.\n\n` +
      `There are many valid approaches — flexbox, grid, absolute positioning with ` +
      `transforms. Pick whichever you're comfortable with, but the box must end up ` +
      `dead-center in the stage.\n\n` +
      `The checker measures the actual pixel position of your box, so eyeballing it ` +
      `won't cut it. The box must stay exactly 120px wide.`,
    requirements: [
      'The .box element must be centered horizontally within .stage.',
      'The .box element must be centered vertically within .stage.',
      'The .box must remain 120px wide.',
      'Use CSS only — do not modify the HTML structure.',
    ],
    rules: [
      'Work alone.',
      'AI tools are allowed, but you must understand your solution.',
      'One pull request per challenge.',
    ],
    tags: ['css', 'layout', 'flexbox'],
    author: 'Git Club Core Team',
    config: {
      type: 'frontend',
      starterHtml: '<div class="stage">\n  <div class="box">Center me</div>\n</div>',
      starterCss:
        '.stage { width: 100%; height: 320px; background: #192320; }\n' +
        '.box { width: 120px; height: 120px; background: #F05133; color: #0B0F0E; font-family: monospace; }',
      checks: [
        { kind: 'exists', selector: '.stage', label: 'Has a .stage container' },
        { kind: 'exists', selector: '.box', label: 'Has a .box element' },
        { kind: 'centered', selector: '.box', within: '.stage', axis: 'x', label: 'Box is centered horizontally' },
        { kind: 'centered', selector: '.box', within: '.stage', axis: 'y', label: 'Box is centered vertically' },
        { kind: 'style', selector: '.box', prop: 'width', matches: '^120px$', label: 'Box is still 120px wide' },
      ],
    },
  },

  {
    id: 'git-trivia-sprint',
    slug: 'git-trivia-sprint',
    title: 'Git Trivia Sprint',
    tagline: 'Eight rapid-fire questions about Git. How well do you know your tools?',
    category: 'git-tools',
    difficulty: 'easy',
    type: 'quiz',
    points: 100,
    opensAt: new Date(at(-1)).toISOString(),
    closesAt: new Date(at(2)).toISOString(),
    maxAttempts: 2,
    description:
      `Think you know Git inside and out? This sprint tests your knowledge of everyday ` +
      `Git commands, concepts, and workflows. Eight questions, four minutes on the clock.\n\n` +
      `Each question has four options. You need at least 60% to pass, but a perfect score ` +
      `earns you bonus XP proportional to your accuracy.\n\n` +
      `Tip: read each question carefully. Some options look similar but mean very ` +
      `different things. No peeking at the docs — this is a sprint, not a marathon.`,
    requirements: [
      'Answer all 8 questions within the time limit.',
      'Score at least 60% (5 out of 8) to pass.',
      'Questions are shuffled each attempt.',
    ],
    rules: [
      'Work alone — no searching during the quiz.',
      'You get 2 attempts.',
      'One pull request per challenge.',
    ],
    tags: ['git', 'quiz', 'fundamentals'],
    author: 'Git Club Core Team',
    config: {
      type: 'quiz',
      timeLimitSec: 240,
      passPercent: 60,
      questions: [
        {
          id: 'gt-01',
          prompt: 'Which command creates a new branch and switches to it?',
          options: ['git branch -n', 'git checkout -b', 'git switch --merge', 'git new'],
          answerIndex: 1,
          explanation: '`git checkout -b <name>` creates a new branch and checks it out in one step.',
        },
        {
          id: 'gt-02',
          prompt: 'What does `git stash` do?',
          options: [
            'Deletes uncommitted changes',
            'Temporarily shelves uncommitted changes',
            'Pushes to a remote',
            'Squashes commits',
          ],
          answerIndex: 1,
          explanation: '`git stash` saves your uncommitted changes to a stack so you can work on something else.',
        },
        {
          id: 'gt-03',
          prompt: 'Which file tells Git which files to ignore?',
          options: ['.gitkeep', '.gitignore', '.gitconfig', '.ignore.json'],
          answerIndex: 1,
          explanation: '.gitignore lists file patterns that Git should not track.',
        },
        {
          id: 'gt-04',
          prompt: 'What does `git pull` do?',
          options: [
            'fetch only',
            'fetch then merge (or rebase)',
            'push then fetch',
            'clone again',
          ],
          answerIndex: 1,
          explanation: '`git pull` fetches from the remote and then merges (or rebases) the changes into your branch.',
        },
        {
          id: 'gt-05',
          prompt: 'Which command shows the commit history in one line per commit?',
          options: ['git log --oneline', 'git history -s', 'git show --short', 'git reflog --one'],
          answerIndex: 0,
          explanation: '`git log --oneline` displays each commit on a single line with a short hash and message.',
        },
        {
          id: 'gt-06',
          prompt: 'What is HEAD?',
          options: [
            'The first commit',
            'A pointer to the current commit or branch',
            "The remote's default branch",
            'The staging area',
          ],
          answerIndex: 1,
          explanation: 'HEAD is a symbolic reference pointing to whatever branch or commit you currently have checked out.',
        },
        {
          id: 'gt-07',
          prompt: 'Which command undoes the last commit but keeps the changes staged?',
          options: [
            'git reset --hard HEAD~1',
            'git reset --soft HEAD~1',
            'git revert --hard',
            'git checkout HEAD~1',
          ],
          answerIndex: 1,
          explanation: '`git reset --soft HEAD~1` moves HEAD back one commit but leaves all changes in the staging area.',
        },
        {
          id: 'gt-08',
          prompt: 'What is a pull request?',
          options: [
            'A command that downloads code',
            'A request to review and merge changes into another branch',
            'A way to delete branches',
            'A type of merge conflict',
          ],
          answerIndex: 1,
          explanation: 'A pull request is a proposal to merge a set of changes from one branch into another, with a review step.',
        },
      ],
    },
  },

  {
    id: 'validate-roll-number',
    slug: 'validate-roll-number',
    title: 'Validate a Roll Number',
    tagline: 'Write one regex to validate CHARUSAT-style roll numbers.',
    category: 'problem-solving',
    difficulty: 'medium',
    type: 'regex',
    points: 150,
    opensAt: new Date(at(-4)).toISOString(),
    closesAt: new Date(at(6)).toISOString(),
    maxAttempts: 5,
    description:
      `Every CHARUSAT student has a roll number like 24CE045 — two digits for the ` +
      `admission year, a branch code (CE, IT, CSE, or EC), and exactly three digits. ` +
      `Your job is to write a single regular expression that accepts only valid roll numbers.\n\n` +
      `The pattern must be anchored (use ^ and $) and match uppercase only. Watch out for ` +
      `edge cases: extra digits, lowercase letters, spaces, or unusual branch codes should ` +
      `all be rejected.\n\n` +
      `The visible test strings let you iterate quickly. Hidden strings will test edge ` +
      `cases you might not expect — so be precise.`,
    requirements: [
      'Match roll numbers with format: 2 digits + branch code (CE|IT|CSE|EC) + 3 digits.',
      'Uppercase only — reject lowercase input.',
      'Anchor your pattern with ^ and $.',
    ],
    rules: [
      'Work alone.',
      'AI tools are allowed, but you must understand your solution.',
      'One pull request per challenge.',
      'Pattern must be a single regex — no code.',
    ],
    tags: ['regex', 'validation', 'patterns'],
    author: 'Git Club Core Team',
    config: {
      type: 'regex',
      brief:
        'Write one regex that accepts valid CHARUSAT-style roll numbers: 2 digits for the admission year, ' +
        'a branch code (CE, IT, CSE or EC), then exactly 3 digits. Uppercase only. Anchor your pattern.',
      shouldMatch: ['24CE045', '23IT012', '25CSE009', '26EC101'],
      shouldReject: ['24ce045', '24ME045', '24CE45', '2CE045'],
      hiddenMatch: ['22CSE999', '24IT000'],
      hiddenReject: ['24CE0450', ' 24CE045', '24CEE045', '24CE04A'],
    },
  },

  {
    id: 'rebuild-landing-page',
    slug: 'rebuild-landing-page',
    title: 'Rebuild the Landing Page',
    tagline: 'Turn an unstyled skeleton into a polished landing page.',
    category: 'web-dev',
    difficulty: 'medium',
    type: 'frontend',
    points: 200,
    opensAt: new Date(at(-1)).toISOString(),
    closesAt: new Date(at(9)).toISOString(),
    maxAttempts: 5,
    description:
      `You've been handed an unstyled HTML skeleton for a product landing page: ` +
      `a header with navigation, a hero section, three feature cards, and a footer. ` +
      `It has good semantic structure but zero visual appeal.\n\n` +
      `Your mission is to bring it to life with CSS. Make the nav links look intentional, ` +
      `give the CTA button a real background color and rounded corners, lay the three ` +
      `feature cards in a row on desktop (and stack them on mobile), set a body font, ` +
      `and center the footer text.\n\n` +
      `The checker tests layout behavior at different viewport widths, so your solution ` +
      `must be responsive. No JavaScript needed — this is a pure CSS challenge.`,
    requirements: [
      'Navigation must contain at least 4 links.',
      'Hero section must have an h1 heading.',
      'CTA button (.cta) must have a visible background color and rounded corners.',
      'Three feature cards must sit in a row at 900px viewport width.',
      'Cards must stack vertically at 375px viewport width.',
      'Body must have a font-family set.',
      'Footer text must be centered.',
    ],
    rules: [
      'Work alone.',
      'CSS only — do not change the HTML structure.',
      'AI tools are allowed, but you must understand your solution.',
      'One pull request per challenge.',
    ],
    tags: ['css', 'responsive', 'layout', 'landing-page'],
    author: 'Git Club Core Team',
    config: {
      type: 'frontend',
      starterHtml:
        '<header>\n' +
        '  <nav>\n' +
        '    <a href="#">Home</a>\n' +
        '    <a href="#">Features</a>\n' +
        '    <a href="#">Pricing</a>\n' +
        '    <a href="#">Contact</a>\n' +
        '  </nav>\n' +
        '</header>\n' +
        '<main>\n' +
        '  <section class="hero">\n' +
        '    <h1>Build something great</h1>\n' +
        '    <p>A modern toolkit for teams who ship fast.</p>\n' +
        '    <a class="cta" href="#">Get started</a>\n' +
        '  </section>\n' +
        '  <section class="features">\n' +
        '    <div class="card">\n' +
        '      <h3>Fast</h3>\n' +
        '      <p>Optimized for speed from the ground up.</p>\n' +
        '    </div>\n' +
        '    <div class="card">\n' +
        '      <h3>Flexible</h3>\n' +
        '      <p>Adapts to your workflow, not the other way around.</p>\n' +
        '    </div>\n' +
        '    <div class="card">\n' +
        '      <h3>Friendly</h3>\n' +
        '      <p>Designed for humans, not just developers.</p>\n' +
        '    </div>\n' +
        '  </section>\n' +
        '</main>\n' +
        '<footer>\n' +
        '  <p>Built with care by the team.</p>\n' +
        '</footer>',
      starterCss: '/* Add your styles here */\n',
      checks: [
        { kind: 'exists', selector: 'nav a', min: 4, label: 'Navigation has 4 links' },
        { kind: 'exists', selector: 'h1', label: 'Hero has a heading' },
        {
          kind: 'style',
          selector: '.cta',
          prop: 'background-color',
          matches: '^(?!rgba\\(0, 0, 0, 0\\)).*$',
          label: 'CTA button has a background color',
        },
        {
          kind: 'style',
          selector: '.cta',
          prop: 'border-radius',
          matches: '^([1-9]\\d*(\\.\\d+)?px|.*%)$',
          label: 'CTA has rounded corners',
        },
        { kind: 'sameRow', selector: '.card', min: 3, label: 'Three feature cards sit in a row on desktop', viewport: 900 },
        { kind: 'stacked', selector: '.card', min: 3, label: 'Cards stack on mobile', viewport: 375 },
        { kind: 'style', selector: 'body', prop: 'font-family', matches: '.+', label: 'Body font is set' },
        { kind: 'style', selector: 'footer', prop: 'text-align', matches: '^center$', label: 'Footer text is centered' },
      ],
    },
  },

  // ── Upcoming challenges ────────────────────────────────────────────
  {
    id: 'poster-for-tech-fest',
    slug: 'poster-for-tech-fest',
    title: 'Poster for Tech Fest',
    tagline: 'Design a poster for the CHARUSAT Tech Fest and share your work.',
    category: 'design',
    difficulty: 'medium',
    type: 'link',
    points: 150,
    opensAt: new Date(at(2)).toISOString(),
    closesAt: new Date(at(12)).toISOString(),
    maxAttempts: 1,
    gallery: true,
    description:
      `CHARUSAT's annual Tech Fest needs a poster, and the Git Club is running this ` +
      `mini design sprint. Create a poster (digital, any tool) that captures the energy ` +
      `of a student-led tech festival: innovation, collaboration, code, and community.\n\n` +
      `Upload your design to Figma, Google Drive, or any image host, then share the link ` +
      `here along with a one-line note about your design concept. Submissions appear in ` +
      `the Gallery for everyone to see and upvote.\n\n` +
      `There's no single right answer — we're looking for creativity and effort. ` +
      `Bonus points (from the community) if your design could actually be printed.`,
    requirements: [
      'Create a poster design for a fictional CHARUSAT Tech Fest.',
      'Share a link to the design (Figma, Drive, or image host).',
      'Include a one-line note explaining your design concept.',
    ],
    rules: [
      'Work alone.',
      'AI-generated art is allowed if you clearly label it.',
      'One submission per challenge.',
      'Keep it appropriate for a university setting.',
    ],
    tags: ['design', 'poster', 'creative'],
    author: 'Git Club Core Team',
    config: {
      type: 'link',
      linkKinds: ['figma', 'drive', 'other'],
      prompt:
        'Share a link (Figma, Drive or an image host) to your poster for the CHARUSAT Tech Fest. ' +
        'Add one line on your design idea.',
    },
  },

  {
    id: 'two-sum-git-edition',
    slug: 'two-sum-git-edition',
    title: 'Two Sum, Git Edition',
    tagline: 'Find two commit line-counts that sum to a target.',
    category: 'algorithms',
    difficulty: 'medium',
    type: 'code',
    points: 200,
    opensAt: new Date(at(3)).toISOString(),
    closesAt: new Date(at(10)).toISOString(),
    maxAttempts: 5,
    description:
      `You're reviewing a repo's commit history and want to find two commits whose ` +
      `combined line count equals a specific target. Given an array of line counts and ` +
      `a target number, return the indices [i, j] (where i < j) of two commits that ` +
      `sum to the target. Return an empty array if no pair exists.\n\n` +
      `A brute-force O(n²) loop works, but the classic hash-map approach runs in O(n). ` +
      `Either is accepted — the tests don't measure performance — but try the efficient ` +
      `path if you can.\n\n` +
      `Watch the edge cases: duplicates, negative numbers, and zero.`,
    requirements: [
      'Return [i, j] (i < j) where commits[i] + commits[j] === target.',
      'Return [] if no valid pair exists.',
      'Handle duplicates, negatives, and zero correctly.',
    ],
    rules: [
      'Work alone.',
      'AI tools are allowed, but you must understand your solution.',
      'One pull request per challenge.',
    ],
    tags: ['javascript', 'hash-map', 'algorithms'],
    author: 'Git Club Core Team',
    config: {
      type: 'code',
      fnName: 'twoSum',
      starter:
        '// Given an array of commit line-counts and a target,\n' +
        '// return [i, j] (i < j) where commits[i] + commits[j] === target.\n' +
        '// Return [] if no pair exists.\n' +
        'function twoSum(commits, target) {\n' +
        '  // your code here\n' +
        '}',
      visibleTests: [
        { args: [[2, 7, 11, 15], 9], expected: [0, 1], label: 'basic pair' },
        { args: [[3, 2, 4], 6], expected: [1, 2], label: 'non-obvious pair' },
        { args: [[1, 2, 3], 10], expected: [], label: 'no pair exists' },
      ],
      hiddenTests: [
        { args: [[3, 3], 6], expected: [0, 1], label: 'duplicate values' },
        { args: [[-1, -2, -3, -4, -5], -8], expected: [2, 4], label: 'negative numbers' },
        { args: [[0, 4, 3, 0], 0], expected: [0, 3], label: 'zero sum' },
      ],
    },
  },

  {
    id: 'ship-a-weekend-project',
    slug: 'ship-a-weekend-project',
    title: 'Ship a Weekend Project',
    tagline: 'Build something small over the weekend and ship it.',
    category: 'open-build',
    difficulty: 'hard',
    type: 'link',
    points: 300,
    opensAt: new Date(at(5)).toISOString(),
    closesAt: new Date(at(19)).toISOString(),
    maxAttempts: 1,
    description:
      `This is an open-ended challenge: build something small, useful, or fun over a ` +
      `weekend and share the GitHub repo link. It could be a CLI tool, a browser ` +
      `extension, a utility library, a small game, or anything else that ships.\n\n` +
      `The only hard requirement is a README that explains what you built, how to run ` +
      `it, and why. Bonus community votes go to projects that are genuinely useful or ` +
      `creative.\n\n` +
      `This is the Arena's hardest challenge by XP — because shipping real code is ` +
      `harder than solving puzzles.`,
    requirements: [
      'Build a small project and push it to a public GitHub repo.',
      'The repo must have a README with: what it is, how to run it, and why you built it.',
      'Share the GitHub link and include the live demo URL in the note (if applicable).',
    ],
    rules: [
      'Work alone.',
      'AI tools are allowed, but you must understand and be able to explain your code.',
      'One submission per challenge.',
      'The project must be your own original work.',
    ],
    tags: ['github', 'project', 'open-source'],
    author: 'Git Club Core Team',
    config: {
      type: 'link',
      linkKinds: ['github'],
      prompt:
        'Ship something small over the weekend and share the GitHub repo and the live demo URL in the note.',
    },
  },

  // ── Completed challenges ───────────────────────────────────────────
  {
    id: 'debug-broken-cart',
    slug: 'debug-broken-cart',
    title: 'Debug the Broken Cart',
    tagline: 'Fix three bugs in a shopping cart total function.',
    category: 'web-dev',
    difficulty: 'medium',
    type: 'code',
    points: 150,
    opensAt: new Date(at(-14)).toISOString(),
    closesAt: new Date(at(-4)).toISOString(),
    maxAttempts: 5,
    description:
      `A junior dev pushed a cartTotal function that computes the order total from ` +
      `an array of items, but it has three bugs: it ignores the quantity field, ` +
      `applies the discount as an absolute value instead of a percentage, and ` +
      `doesn't round the result to two decimals.\n\n` +
      `Your job is to find and fix all three bugs so every test passes. The function ` +
      `takes an array of items, each with a price, qty, and an optional ` +
      `discountPercent.\n\n` +
      `This challenge is now closed, but you can still practice in read-only mode ` +
      `to see how the code engine works.`,
    requirements: [
      'Fix the quantity bug: multiply price by qty.',
      'Fix the discount bug: apply discountPercent as a percentage, not an absolute value.',
      'Fix the rounding bug: return the total rounded to 2 decimal places.',
    ],
    rules: [
      'Work alone.',
      'AI tools are allowed, but you must understand your solution.',
      'One pull request per challenge.',
    ],
    tags: ['javascript', 'debugging', 'math'],
    author: 'Git Club Core Team',
    config: {
      type: 'code',
      fnName: 'cartTotal',
      starter:
        '// Bug 1: ignores qty\n' +
        '// Bug 2: applies discount as absolute value\n' +
        '// Bug 3: no rounding\n' +
        'function cartTotal(items) {\n' +
        '  let total = 0;\n' +
        '  for (const item of items) {\n' +
        '    let price = item.price; // Bug 1: should multiply by qty\n' +
        '    if (item.discountPercent) {\n' +
        '      price = price - item.discountPercent; // Bug 2: should be percentage\n' +
        '    }\n' +
        '    total += price;\n' +
        '  }\n' +
        '  return total; // Bug 3: should round to 2 decimals\n' +
        '}',
      visibleTests: [
        { args: [[{ price: 100, qty: 2 }]], expected: 200, label: 'simple qty multiply' },
        { args: [[{ price: 50, qty: 1, discountPercent: 10 }]], expected: 45, label: 'discount as percentage' },
        { args: [[]], expected: 0, label: 'empty cart' },
      ],
      hiddenTests: [
        { args: [[{ price: 19.99, qty: 3 }]], expected: 59.97, label: 'decimal precision' },
        {
          args: [[{ price: 200, qty: 1, discountPercent: 25 }, { price: 10, qty: 5 }]],
          expected: 200,
          label: 'mixed items with discount',
        },
      ],
    },
  },

  {
    id: 'logo-redesign-sprint',
    slug: 'logo-redesign-sprint',
    title: 'Logo Redesign Sprint',
    tagline: 'Redesign the Git Club logo and share your concept.',
    category: 'design',
    difficulty: 'easy',
    type: 'link',
    points: 100,
    opensAt: new Date(at(-20)).toISOString(),
    closesAt: new Date(at(-8)).toISOString(),
    maxAttempts: 1,
    gallery: true,
    description:
      `The Git Club's logo is due for a refresh. In this design sprint, your challenge ` +
      `is to redesign the club's logo — something that captures the spirit of Git, ` +
      `open source, and student-led learning.\n\n` +
      `Upload your design to Figma, Drive, or any image host and share the link. ` +
      `Include a one-line description of your concept. All merged submissions appear ` +
      `in the Gallery for the community to upvote.\n\n` +
      `This challenge has ended, but you can browse the Gallery to see what others ` +
      `submitted.`,
    requirements: [
      'Design a new logo concept for the Git Club.',
      'Share a link to the design file.',
      'Include a one-line description of your design concept.',
    ],
    rules: [
      'Work alone.',
      'AI-generated art is allowed if clearly labeled.',
      'One submission per challenge.',
    ],
    tags: ['design', 'logo', 'branding'],
    author: 'Git Club Core Team',
    config: {
      type: 'link',
      linkKinds: ['figma', 'drive', 'other'],
      prompt: 'Share a link to your Git Club logo redesign. Add one line about your design concept.',
    },
  },
  {
    id: 'undo-the-damage',
    slug: 'undo-the-damage',
    title: 'Undo the Damage',
    tagline: 'Oops, wrong branch. Can you fix the history?',
    category: 'git-tools',
    difficulty: 'hard',
    type: 'git-terminal',
    points: 300,
    opensAt: new Date(at(+5)).toISOString(), // Upcoming (or I can set to +1)
    closesAt: new Date(at(+15)).toISOString(),
    maxAttempts: 5,
    description: 
      `You just committed a new feature, but realized you were on the \`main\` branch instead of \`feature/login\`!\n\n` +
      `Your task is to fix the repository state using the terminal. \n\n` +
      `Goal: \`main\` should have exactly 2 commits (init, update readme), and \`feature/login\` should contain the third commit (add login form).\n\n` +
      `Use standard git commands to branch, reset, and cherry-pick. Type \`git help\` for a list of supported commands in this simulator.`,
    requirements: [
      'main must have exactly 2 commits (init, update readme)',
      'feature/login must contain the third commit (add login form)',
      'The current branch at the end does not matter',
    ],
    rules: [
      'Work alone.',
      'One pull request per challenge.'
    ],
    tags: ['git', 'history', 'reset'],
    author: 'Git Club Core Team',
    config: {
      type: 'git-terminal',
      scenarioId: 'oops-wrong-branch'
    }
  }
];
