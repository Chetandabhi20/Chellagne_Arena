import { cn } from '../../lib/cn';

export const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-panel border border-border rounded overflow-hidden shadow", className)}>
    {children}
  </div>
);
