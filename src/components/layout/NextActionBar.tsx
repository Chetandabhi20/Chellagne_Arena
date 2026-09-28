import { Button } from '../ui';
import { ArrowRight } from 'lucide-react';

export const NextActionBar = () => {
  return (
    <div className="sticky top-16 z-30 bg-panel-2 border-b border-border h-12 flex items-center px-4 sm:px-6">
      <div className="flex items-center gap-3 w-full max-w-5xl mx-auto">
        <span className="text-accent font-mono">→</span>
        <span className="font-mono text-sm truncate flex-1">Start your first challenge: Center That Div, easy · +100 XP</span>
        <Button size="sm" variant="primary" className="shrink-0 hidden sm:flex gap-1">
          Check out <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
