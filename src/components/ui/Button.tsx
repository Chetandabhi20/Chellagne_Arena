import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ variant = 'secondary', size = 'md', className, ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-mono rounded transition-colors focus-ring disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-accent text-accent-fg hover:bg-accent/90",
    secondary: "bg-panel-2 border border-border text-text hover:bg-border",
    ghost: "bg-transparent hover:bg-panel-2 text-text",
    danger: "bg-danger text-accent-fg hover:bg-danger/90",
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
  };

  return (
    <button ref={ref} className={cn(baseStyles, variants[variant], sizes[size], className)} {...props} />
  );
});
Button.displayName = 'Button';
