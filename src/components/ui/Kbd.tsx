
export const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="font-mono text-xs px-1.5 py-0.5 bg-panel-2 border border-border rounded text-muted shadow-[0_1px_0_var(--border)]">
    {children}
  </kbd>
);
