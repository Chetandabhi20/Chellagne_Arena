import { cn } from '../../lib/cn';

export const Tag = ({ 
  label, 
  variant = 'default',
  className 
}: { 
  label: string, 
  variant?: 'default' | 'blue', 
  className?: string 
}) => (
  <span className={cn(
    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono border",
    variant === 'default' && "bg-panel-2 border-border text-muted",
    variant === 'blue' && "bg-blue-500/10 border-blue-500/20 text-blue-400",
    className
  )}>
    {label}
  </span>
);
