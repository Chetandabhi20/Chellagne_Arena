import { cn } from '../../lib/cn';

export const StatusPill = ({ status, className }: { status: 'upcoming' | 'active' | 'completed' | 'open' | 'in-review' | 'merged', className?: string }) => {
  const variants = {
    upcoming: "border-warning text-warning",
    active: "border-success text-success",
    completed: "border-muted text-muted",
    open: "border-success text-success",
    "in-review": "border-warning text-warning bg-warning/10",
    merged: "border-success bg-success text-accent-fg",
  };
  
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-pill border text-xs font-mono", variants[status], className)}>
      {status}
    </span>
  );
};
