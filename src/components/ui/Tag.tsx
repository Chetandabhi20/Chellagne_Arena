import { cn } from '../../lib/cn';

export const Tag = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-pill bg-panel-2 border border-border text-xs font-mono text-muted", className)}>
    {children}
  </span>
);
