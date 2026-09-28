
export const ProgressBar = ({ progress, className }: { progress: number, className?: string }) => (
  <div className={`w-full bg-panel-2 rounded-pill overflow-hidden h-2 ${className || ''}`}>
    <div className="bg-accent h-full transition-all duration-300" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
  </div>
);
