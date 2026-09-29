import { describe, it, expect } from 'vitest';
import { GitTerminalMachine, SCENARIOS } from './gitTerminalEngine';

describe('GitTerminalMachine', () => {
  it('handles oops-wrong-branch scenario', () => {
    const machine = new GitTerminalMachine(SCENARIOS['oops-wrong-branch']);
    
    // Initial state
    expect(machine.isGoalMet('oops-wrong-branch')).toBe(false);
    expect(machine.state.head).toBe('main');

    // Create branch
    let out = machine.execute('git branch feature/login');
    expect(out.isError).toBeFalsy();
    expect(machine.state.branches['feature/login']).toHaveLength(3);

    // Reset main
    out = machine.execute('git reset --hard HEAD~1');
    expect(out.isError).toBeFalsy();
    expect(machine.state.branches['main']).toHaveLength(2);
    
    // Check goal met? No, feature/login has it but wait, main has 2 and feature has 3.
    // Yes! The goal is main has 2 commits, feature/login has c3.
    expect(machine.isGoalMet('oops-wrong-branch')).toBe(true);
  });

  it('can switch branches and cherry pick', () => {
    const machine = new GitTerminalMachine(SCENARIOS['oops-wrong-branch']);
    
    // reset main
    machine.execute('git reset --hard HEAD~1');
    
    // switch to new branch (simulate forgot to branch)
    machine.execute('git branch feature/login');
    machine.execute('git switch feature/login');
    
    // cherry pick c3
    const out = machine.execute('git cherry-pick c3-logi');
    expect(out.isError).toBeFalsy();
    
    expect(machine.isGoalMet('oops-wrong-branch')).toBe(true);
  });

  it('returns errors for unsupported commands', () => {
    const machine = new GitTerminalMachine(SCENARIOS['oops-wrong-branch']);
    const out = machine.execute('git fetch');
    expect(out.isError).toBe(true);
    expect(out.text).toContain('not supported');
  });

  it('supports git log --oneline', () => {
    const machine = new GitTerminalMachine(SCENARIOS['oops-wrong-branch']);
    const out = machine.execute('git log --oneline');
    expect(out.text).toContain('c3-logi add login form');
    expect(out.text).toContain('c2-upda update readme');
    expect(out.text).toContain('c1-init init');
  });
});
