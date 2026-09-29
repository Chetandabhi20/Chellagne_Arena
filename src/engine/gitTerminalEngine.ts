export interface GitCommit {
  hash: string;
  message: string;
}

export interface GitState {
  commits: Record<string, GitCommit>;
  branches: Record<string, string[]>; // branchName -> array of commit hashes (oldest to newest)
  head: string; // current branch name (detached HEAD not strictly required but good to handle)
}

export interface TerminalOutput {
  text: string;
  isError?: boolean;
}

export class GitTerminalMachine {
  state: GitState;
  
  constructor(initialState: GitState) {
    // deep copy to avoid mutating seeds
    this.state = JSON.parse(JSON.stringify(initialState));
  }

  getCurrentBranchCommits(): string[] {
    const branch = this.state.branches[this.state.head];
    return branch || [];
  }

  execute(command: string): TerminalOutput {
    const args = command.trim().split(/\s+/);
    if (args[0] !== 'git') {
      if (args[0] === 'help') {
        return { text: "Supported commands:\ngit status\ngit log --oneline\ngit branch\ngit branch <name>\ngit checkout <branch>\ngit switch <branch>\ngit reset --hard HEAD~1\ngit cherry-pick <hash>" };
      }
      return { text: `bash: ${args[0]}: command not found`, isError: true };
    }

    const subcmd = args[1];
    
    if (subcmd === 'status') {
      return { text: `On branch ${this.state.head}\nnothing to commit, working tree clean` };
    }

    if (subcmd === 'log' && args[2] === '--oneline') {
      const commits = this.getCurrentBranchCommits();
      if (commits.length === 0) return { text: '' };
      // log goes from newest to oldest
      const lines = [...commits].reverse().map(hash => {
        return `${hash.substring(0, 7)} ${this.state.commits[hash].message}`;
      });
      return { text: lines.join('\n') };
    }

    if (subcmd === 'branch') {
      if (args.length === 2) {
        // list branches
        const branches = Object.keys(this.state.branches).sort();
        const lines = branches.map(b => (b === this.state.head ? `* ${b}` : `  ${b}`));
        return { text: lines.join('\n') };
      } else if (args.length === 3) {
        // create branch
        const newBranch = args[2];
        if (this.state.branches[newBranch]) {
          return { text: `fatal: A branch named '${newBranch}' already exists.`, isError: true };
        }
        this.state.branches[newBranch] = [...this.getCurrentBranchCommits()];
        return { text: '' };
      }
    }

    if ((subcmd === 'checkout' || subcmd === 'switch') && args.length === 3) {
      const target = args[2];
      if (target === '-b') { // technically not required by spec but nice to have
         return { text: `git: 'checkout -b' is not supported in this simulator, use branch then checkout`, isError: true };
      }
      if (!this.state.branches[target]) {
        return { text: `error: pathspec '${target}' did not match any file(s) known to git`, isError: true };
      }
      this.state.head = target;
      return { text: `Switched to branch '${target}'` };
    }

    if (subcmd === 'reset' && args[2] === '--hard' && args[3] === 'HEAD~1') {
      const commits = this.getCurrentBranchCommits();
      if (commits.length === 0) {
        return { text: `fatal: ambiguous argument 'HEAD~1': unknown revision or path`, isError: true };
      }
      commits.pop();
      this.state.branches[this.state.head] = commits;
      const newHeadHash = commits[commits.length - 1];
      return { text: `HEAD is now at ${newHeadHash.substring(0, 7)} ${this.state.commits[newHeadHash].message}` };
    }

    if (subcmd === 'cherry-pick' && args.length === 3) {
      const hash = args[2];
      // find commit by prefix
      const commit = Object.values(this.state.commits).find(c => c.hash.startsWith(hash));
      if (!commit) {
        return { text: `fatal: bad revision '${hash}'`, isError: true };
      }
      const commits = this.getCurrentBranchCommits();
      if (commits.includes(commit.hash)) {
        return { text: `The previous cherry-pick is now empty, possibly due to conflict resolution.`, isError: true }; // simplification
      }
      commits.push(commit.hash);
      this.state.branches[this.state.head] = commits;
      return { text: `[${this.state.head} ${commit.hash.substring(0, 7)}] ${commit.message}` };
    }

    return { text: `git: '${subcmd || ''}' is not supported in this simulator`, isError: true };
  }

  isGoalMet(scenarioId: string): boolean {
    if (scenarioId === 'oops-wrong-branch') {
      // Goal: main has 2 commits, feature/login contains the third.
      const mainCommits = this.state.branches['main'];
      const featureCommits = this.state.branches['feature/login'];
      
      if (!mainCommits || !featureCommits) return false;
      
      // We expect main to have c1 and c2, feature/login to have c1, c2, c3
      // c3 is "add login form"
      const hasC1C2OnMain = mainCommits.length === 2 && mainCommits[1] === 'c2-update';
      const hasC3OnFeature = featureCommits.includes('c3-login');
      
      return hasC1C2OnMain && hasC3OnFeature;
    }
    return false;
  }
}

export const SCENARIOS: Record<string, GitState> = {
  'oops-wrong-branch': {
    commits: {
      'c1-init': { hash: 'c1-init', message: 'init' },
      'c2-update': { hash: 'c2-update', message: 'update readme' },
      'c3-login': { hash: 'c3-login', message: 'add login form' },
    },
    branches: {
      'main': ['c1-init', 'c2-update', 'c3-login']
    },
    head: 'main'
  }
};

export const gitTerminalEngine = {
  async run(_challenge: import('../types').Challenge, payload: any): Promise<import('./types').CheckOutput> {
    return { passed: payload?.goalMet === true, scoreFraction: payload?.goalMet ? 1 : 0, feedback: [] };
  },
  async submit(_challenge: import('../types').Challenge, payload: any): Promise<import('./types').CheckOutput> {
    return { passed: payload?.goalMet === true, scoreFraction: payload?.goalMet ? 1 : 0, feedback: [] };
  }
};
