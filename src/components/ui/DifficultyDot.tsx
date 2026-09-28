import { cn } from '../../lib/cn';

export const DifficultyDot = ({ difficulty, className }: { difficulty: string, className?: string }) => {
  const colors: Record<string, string> = {
    easy: "bg-success",
    medium: "bg-warning",
    hard: "bg-accent",
  };
  return (
    <span className={cn("w-2 h-2 inline-block rounded-full", colors[difficulty] || "bg-muted", className)} />
  );
};
