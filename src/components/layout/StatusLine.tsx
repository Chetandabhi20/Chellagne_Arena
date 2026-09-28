import { GitCommit } from 'lucide-react';

export const StatusLine = () => {
  return (
    <div className="hidden md:flex fixed bottom-0 left-0 right-0 h-8 bg-panel border-t border-border items-center justify-between px-4 font-mono text-xs text-muted z-40">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1 text-text"><GitCommit className="w-3 h-3" /> main</span>
        <span>Contributor</span>
        <span>120 XP</span>
        <span>streak 2</span>
      </div>
      <div>
        <a href="#" className="hover:text-text">Git Club CHARUSAT</a>
      </div>
    </div>
  );
};
