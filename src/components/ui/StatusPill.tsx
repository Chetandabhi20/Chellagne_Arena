import { cn } from '../../lib/cn';

export const StatusPill = ({ 
  label,
  variant, 
  className 
}: { 
  label: string;
  variant: 'success' | 'warning' | 'blue' | 'neutral';
  className?: string 
}) => {
  const variants = {
    success: "border-success text-success bg-success/10",
    warning: "border-warning text-warning bg-warning/10",
    blue: "border-blue-500 text-blue-400 bg-blue-500/10",
    neutral: "border-border text-muted bg-panel-2",
  };
  
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-mono font-medium", variants[variant], className)}>
      {label}
    </span>
  );
};
