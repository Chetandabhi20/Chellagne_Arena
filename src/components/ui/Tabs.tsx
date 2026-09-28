import { cn } from '../../lib/cn';

export const Tabs = ({ tabs, active, onChange }: { tabs: { id: string, label: string }[], active: string, onChange: (id: string) => void }) => (
  <div className="flex gap-4 border-b border-border" role="tablist">
    {tabs.map(t => (
      <button
        key={t.id}
        role="tab"
        aria-selected={active === t.id}
        className={cn("pb-2 text-sm font-medium border-b-2 transition-colors focus-ring", active === t.id ? "border-accent text-text" : "border-transparent text-muted hover:text-text")}
        onClick={() => onChange(t.id)}
      >
        {t.label}
      </button>
    ))}
  </div>
);
