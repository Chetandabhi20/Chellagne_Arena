import { cn } from '../../lib/cn';

export const DifficultyDot = ({ diff, className }: { diff: 'easy' | 'medium' | 'hard', className?: string }) => {
  const colors = {
    easy: "bg-success",
    medium: "bg-warning",
    hard: "bg-accent",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-mono text-muted", className)}>
      <span className={cn("w-2 h-2 rounded-full", colors[diff])} />
      {diff}
    </span>
  );
};
