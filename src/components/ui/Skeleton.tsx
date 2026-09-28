import { cn } from '../../lib/cn';

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-panel-2 rounded", className)} />
);
