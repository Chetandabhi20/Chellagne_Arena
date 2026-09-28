export interface GallerySeed {
  id: string;
  challengeSlug: string;
  authorName: string;
  authorId: string;
  note: string;
  url: string;
  votes: number;
}

export const gallerySeed: GallerySeed[] = [
  {
    id: 'gs-01',
    challengeSlug: 'logo-redesign-sprint',
    authorName: 'Rutvi Patel',
    authorId: '24CE045',
    note: 'Minimal branching tree that forms the letter G — inspired by git log --graph.',
    url: 'https://www.figma.com/community/file/rutvi-gitclub-logo',
    votes: 21,
  },
  {
    id: 'gs-02',
    challengeSlug: 'logo-redesign-sprint',
    authorName: 'Nidhi Desai',
    authorId: '25CSE009',
    note: 'Pixel-art octocat-style mascot holding a CHARUSAT flag.',
    url: 'https://www.figma.com/community/file/nidhi-gitclub-logo',
    votes: 17,
  },
  {
    id: 'gs-03',
    challengeSlug: 'logo-redesign-sprint',
    authorName: 'Dhruv Parmar',
    authorId: '24CSE031',
    note: 'Clean geometric mark combining a merge arrow with a graduation cap.',
    url: 'https://www.figma.com/community/file/dhruv-gitclub-logo',
    votes: 14,
  },
  {
    id: 'gs-04',
    challengeSlug: 'logo-redesign-sprint',
    authorName: 'Priya Chauhan',
    authorId: '25IT041',
    note: 'Hand-lettered wordmark with a commit-graph underline.',
    url: 'https://www.figma.com/community/file/priya-gitclub-logo',
    votes: 9,
  },
  {
    id: 'gs-05',
    challengeSlug: 'logo-redesign-sprint',
    authorName: 'Jay Rathod',
    authorId: '26CE007',
    note: 'Neon terminal-style logo with a blinking cursor.',
    url: 'https://www.figma.com/community/file/jay-gitclub-logo',
    votes: 6,
  },
  {
    id: 'gs-06',
    challengeSlug: 'logo-redesign-sprint',
    authorName: 'Tanvi Modi',
    authorId: '24CSE059',
    note: 'Flat illustration of a code editor window shaped like the Git logo.',
    url: 'https://www.figma.com/community/file/tanvi-gitclub-logo',
    votes: 3,
  },
];
