import React, { useState, useEffect, useRef } from 'react';
import { GitTerminalMachine, SCENARIOS } from '../../engine/gitTerminalEngine';
import type { TerminalOutput } from '../../engine/gitTerminalEngine';
import { Button } from '../ui/Button';

import type { SolverProps } from './SolverRegistry';

interface OutputLine {
  id: string;
  command?: string;
  output: TerminalOutput;
}

export default function GitTerminalSolver({ challenge, onSubmit, attemptsLeft, isPractice }: SolverProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [lines, setLines] = useState<OutputLine[]>([]);
  const [machine, setMachine] = useState<GitTerminalMachine | null>(null);
  const [goalMet, setGoalMet] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (challenge.config.type === 'git-terminal') {
      const scenarioId = challenge.config.scenarioId;
      setMachine(new GitTerminalMachine(SCENARIOS[scenarioId]));
      setLines([{ id: 'init', output: { text: "Type 'git help' for supported commands. Use 'git status' and 'git log --oneline' to look around." } }]);
    }
  }, [challenge]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  if (challenge.config.type !== 'git-terminal' || !machine) return null;
  const scenarioId = challenge.config.scenarioId;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const cmd = input.trim();
      if (!cmd) return;
      
      const output = machine.execute(cmd);
      setLines(prev => [...prev, { id: Math.random().toString(), command: cmd, output }]);
      setHistory(prev => [...prev, cmd]);
      setHistoryIndex(-1);
      setInput('');
      
      if (machine.isGoalMet(scenarioId)) {
        setGoalMet(true);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIndex = historyIndex + 1;
        if (nextIndex < history.length) {
          setHistoryIndex(nextIndex);
          setInput(history[history.length - 1 - nextIndex]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInput(history[history.length - 1 - nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit({ goalMet });
    setIsSubmitting(false);
  };

  const noAttempts = attemptsLeft !== null && attemptsLeft <= 0;
  const disableSubmit = isSubmitting || (!goalMet) || (noAttempts && !isPractice);
  
  return (
    <div className="flex flex-col h-64 bg-[var(--panel-2)] rounded-lg overflow-hidden border border-[var(--border)]">
      <div 
        ref={scrollRef}
        className="flex-1 p-4 font-mono text-[var(--text)] text-[13px] leading-[20px] overflow-y-auto whitespace-pre-wrap"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map(line => (
          <div key={line.id} className="mb-2">
            {line.command && <div><span className="text-[var(--success)]">$</span> {line.command}</div>}
            {line.output.text && (
              <div className={line.output.isError ? 'text-[var(--danger)]' : 'text-[var(--muted)]'}>
                {line.output.text}
              </div>
            )}
          </div>
        ))}
        {!noAttempts && !goalMet && (
          <div className="flex">
            <span className="text-[var(--success)] mr-2">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-[var(--text)] font-mono"
              autoComplete="off"
              spellCheck={false}
              autoCapitalize="off"
              autoFocus
            />
          </div>
        )}
        {goalMet && (
          <div className="mt-4 p-3 bg-[var(--success)]/10 text-[var(--success)] rounded border border-[var(--success)]/20">
            Goal met! You fixed the repository state.
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-[var(--border)] bg-[var(--panel)] flex justify-between items-center">
        <div className="text-[var(--muted)] text-sm">
          {noAttempts ? 'No attempts left' : 'Fix the branch state to submit'}
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={disableSubmit}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Fix'}
        </Button>
      </div>
    </div>
  );
}
