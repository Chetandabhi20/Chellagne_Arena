import fs from 'fs';
import path from 'path';

const files = {
  'src/components/ui/Button.tsx': `
import React from 'react';
import { cn } from '../../lib/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ variant = 'secondary', size = 'md', className, ...props }, ref) => {
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
`,
  'src/components/ui/Tag.tsx': `
import React from 'react';
import { cn } from '../../lib/cn';

export const Tag = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-pill bg-panel-2 border border-border text-xs font-mono text-muted", className)}>
    {children}
  </span>
);
`,
  'src/components/ui/StatusPill.tsx': `
import React from 'react';
import { cn } from '../../lib/cn';

export const StatusPill = ({ status, className }: { status: 'upcoming' | 'active' | 'completed' | 'open' | 'in-review' | 'merged', className?: string }) => {
  const variants = {
    upcoming: "border-warning text-warning",
    active: "border-success text-success",
    completed: "border-muted text-muted",
    open: "border-success text-success",
    "in-review": "border-warning text-warning bg-warning/10",
    merged: "border-success bg-success text-accent-fg",
  };
  
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-pill border text-xs font-mono", variants[status], className)}>
      {status}
    </span>
  );
};
`,
  'src/components/ui/DifficultyDot.tsx': `
import React from 'react';
import { cn } from '../../lib/cn';

export const DifficultyDot = ({ diff, className }: { diff: 'easy' | 'medium' | 'hard', className?: string }) => {
  const colors = {
    easy: "bg-success",
    medium: "bg-warning",
    hard: "bg-accent",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-mono text-muted", className)}>
      <span className={cn("w-2 h-2 rounded-full", colors[diff])} />
      {diff}
    </span>
  );
};
`,
  'src/components/ui/Card.tsx': `
import React from 'react';
import { cn } from '../../lib/cn';

export const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-panel border border-border rounded overflow-hidden shadow", className)}>
    {children}
  </div>
);
`,
  'src/components/ui/Tabs.tsx': `
import React from 'react';
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
`,
  'src/components/ui/Modal.tsx': `
import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/cn';

export const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog ref={dialogRef} onClose={onClose} className="bg-panel text-text rounded-modal border border-border p-6 shadow max-w-md w-full backdrop:bg-bg/80 backdrop:backdrop-blur-sm focus:outline-none">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-mono font-bold">{title}</h2>
        <button onClick={onClose} className="text-muted hover:text-text focus-ring rounded p-1">&times;</button>
      </div>
      <div>{children}</div>
    </dialog>
  );
};
`,
  'src/components/ui/Skeleton.tsx': `
import React from 'react';
import { cn } from '../../lib/cn';

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-panel-2 rounded", className)} />
);
`,
  'src/components/ui/EmptyState.tsx': `
import React from 'react';

export const EmptyState = ({ icon: Icon, message, action }: { icon: any, message: string, action?: React.ReactNode }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center border border-border border-dashed rounded bg-panel-2/50">
    <Icon className="w-8 h-8 text-muted mb-4" />
    <p className="text-muted mb-4">{message}</p>
    {action}
  </div>
);
`,
  'src/components/ui/ProgressBar.tsx': `
import React from 'react';

export const ProgressBar = ({ progress, className }: { progress: number, className?: string }) => (
  <div className={\`w-full bg-panel-2 rounded-pill overflow-hidden h-2 \${className || ''}\`}>
    <div className="bg-accent h-full transition-all duration-300" style={{ width: \`\${Math.min(100, Math.max(0, progress))}%\` }} />
  </div>
);
`,
  'src/components/ui/Kbd.tsx': `
import React from 'react';

export const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="font-mono text-xs px-1.5 py-0.5 bg-panel-2 border border-border rounded text-muted shadow-[0_1px_0_var(--border)]">
    {children}
  </kbd>
);
`,
  'src/components/ui/CommitLine.tsx': `
import React from 'react';
import { ActivityEntry } from '../../types';

export const CommitLine = ({ entry }: { entry: ActivityEntry }) => (
  <div className="flex items-center gap-2 text-sm font-mono text-muted py-1">
    <span className="text-accent">{entry.id.substring(0, 7)}</span>
    <span>·</span>
    <span className="text-text">{entry.actor}</span>
    <span>{entry.verb}</span>
    <span className="text-text">"{entry.challengeSlug}"</span>
    {entry.xp && <span className="text-success">+{entry.xp} XP</span>}
    <span>·</span>
    <span>{new Date(entry.at).toLocaleTimeString()}</span>
  </div>
);
`,
  'src/components/ui/ChallengeCover.tsx': `
import React from 'react';
import { useReducedMotion } from '../../hooks';
import { motion, useMotionValue, useTransform } from 'framer-motion';

export const ChallengeCover = ({ slug, size = 'sm' }: { slug: string, size?: 'sm' | 'lg' }) => {
  const reduced = useReducedMotion();
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const bgX = useTransform(mouseX, [0, 1], [5, -5]);
  const bgY = useTransform(mouseY, [0, 1], [5, -5]);
  const fgX = useTransform(mouseX, [0, 1], [-10, 10]);
  const fgY = useTransform(mouseY, [0, 1], [-10, 10]);

  const height = size === 'sm' ? 120 : 200;

  return (
    <div 
      className="relative w-full overflow-hidden bg-panel-2 border-b border-border" 
      style={{ height, perspective: 1000 }}
      onMouseMove={(e) => {
        if (reduced) return;
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width);
        mouseY.set((e.clientY - rect.top) / rect.height);
      }}
      onMouseLeave={() => {
        mouseX.set(0.5);
        mouseY.set(0.5);
      }}
    >
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ x: reduced ? 0 : bgX, y: reduced ? 0 : bgY }}
      >
        <svg width="100" height="100" viewBox="0 0 100 100" className="text-border opacity-50">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </motion.div>
      <div className="absolute inset-0 flex items-center justify-center">
         <svg width="60" height="60" viewBox="0 0 100 100" className="text-muted opacity-80">
          <rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="4" />
        </svg>
      </div>
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ x: reduced ? 0 : fgX, y: reduced ? 0 : fgY }}
      >
        <svg width="40" height="40" viewBox="0 0 100 100" className="text-accent">
          <path d="M10 90 L50 10 L90 90 Z" fill="currentColor" />
        </svg>
      </motion.div>
    </div>
  );
};
`,
  'src/components/ui/Toast.tsx': `
import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/cn';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export interface ToastMsg { id: string; type: 'success'|'error'|'info'; message: string; }

let addToastRef: (msg: Omit<ToastMsg, 'id'>) => void = () => {};

export const toast = (msg: Omit<ToastMsg, 'id'>) => addToastRef(msg);

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  useEffect(() => {
    addToastRef = (msg) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts(prev => [...prev, { ...msg, id }].slice(-3));
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none sm:top-4 sm:bottom-auto">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div 
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn("pointer-events-auto flex items-center gap-3 px-4 py-3 rounded border shadow-lg bg-panel text-sm", {
              'border-success text-success': t.type === 'success',
              'border-danger text-danger': t.type === 'error',
              'border-border text-text': t.type === 'info',
            })}
            role="status"
          >
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-muted" />}
            <span className="text-text">{t.message}</span>
            <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))} className="text-muted hover:text-text ml-2">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
`,
  'src/components/ui/Countdown.tsx': `
import React from 'react';
import { useNow } from '../../hooks';

export const Countdown = ({ to, prefix = 'Closes in' }: { to: number, prefix?: string }) => {
  const now = useNow(1000);
  const diff = Math.max(0, to - now);
  
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  
  return <span className="font-mono text-muted">{prefix} {d}d {h}h</span>;
};
`,
  'src/components/ui/CountUp.tsx': `
import React, { useEffect, useState } from 'react';
import { useReducedMotion } from '../../hooks';

export const CountUp = ({ value, prefix = '', suffix = '' }: { value: number, prefix?: string, suffix?: string }) => {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced) { setDisplay(value); return; }
    let start = 0;
    const end = value;
    if (start === end) return;
    const duration = 1000;
    const startTime = performance.now();
    
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.floor(ease * (end - start) + start));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, reduced]);

  return <span className="font-mono">{prefix}{display}{suffix}</span>;
};
`,
  'src/components/ui/index.ts': `
export * from './Button';
export * from './Tag';
export * from './StatusPill';
export * from './DifficultyDot';
export * from './Card';
export * from './Tabs';
export * from './Modal';
export * from './Skeleton';
export * from './EmptyState';
export * from './ProgressBar';
export * from './Kbd';
export * from './CommitLine';
export * from './ChallengeCover';
export * from './Toast';
export * from './Countdown';
export * from './CountUp';
`,
  'src/components/layout/Header.tsx': `
import React from 'react';
import { GitBranch } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Kbd } from '../ui/Kbd';
import { cn } from '../../lib/cn';

export const Header = () => {
  const { theme, setTheme, profile } = useStore();
  return (
    <header className="sticky top-0 z-40 bg-bg border-b border-border h-16 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2 font-mono font-bold text-text hover:text-accent transition-colors">
          <GitBranch className="w-5 h-5 text-accent" />
          <span>git-club / arena</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 font-mono text-sm">
          <NavLink to="/" className={({isActive}) => cn(isActive ? "text-text font-bold" : "text-muted hover:text-text")}>Arena</NavLink>
          <NavLink to="/daily" className={({isActive}) => cn(isActive ? "text-text font-bold" : "text-muted hover:text-text")}>Daily</NavLink>
          <NavLink to="/progress" className={({isActive}) => cn(isActive ? "text-text font-bold" : "text-muted hover:text-text")}>Progress</NavLink>
          <NavLink to="/leaderboard" className={({isActive}) => cn(isActive ? "text-text font-bold" : "text-muted hover:text-text")}>League</NavLink>
          <NavLink to="/gallery" className={({isActive}) => cn(isActive ? "text-text font-bold" : "text-muted hover:text-text")}>Gallery</NavLink>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-panel border border-border rounded text-sm text-muted hover:text-text focus-ring">
          Search... <Kbd>Ctrl K</Kbd>
        </button>
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="text-muted hover:text-text focus-ring rounded p-1">
          {theme === 'dark' ? '☼' : '☾'}
        </button>
        <div className="flex items-center gap-2 bg-panel-2 border border-border rounded-pill px-3 py-1 cursor-pointer hover:bg-border transition-colors">
          <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-accent-fg font-mono text-xs font-bold">
            {profile.name.substring(0, 2).toUpperCase()}
          </div>
          <span className="hidden sm:inline font-mono text-xs font-bold">XP</span>
        </div>
      </div>
    </header>
  );
};
`,
  'src/components/layout/NextActionBar.tsx': `
import React from 'react';
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
`,
  'src/components/layout/StatusLine.tsx': `
import React from 'react';
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
`,
  'src/components/layout/TabBar.tsx': `
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, TrendingUp, Trophy, Menu } from 'lucide-react';
import { cn } from '../../lib/cn';

export const TabBar = () => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-panel border-t border-border flex items-center justify-around z-40 pb-safe">
      {[
        { to: '/', icon: Home, label: 'Arena' },
        { to: '/daily', icon: Calendar, label: 'Daily' },
        { to: '/progress', icon: TrendingUp, label: 'Progress' },
        { to: '/leaderboard', icon: Trophy, label: 'League' },
        { to: '/more', icon: Menu, label: 'More' },
      ].map(tab => (
        <NavLink key={tab.to} to={tab.to} className={({isActive}) => cn("flex flex-col items-center gap-1 w-16 focus-ring rounded p-1", isActive ? "text-text" : "text-muted hover:text-text")}>
          <tab.icon className="w-5 h-5" />
          <span className="text-[10px] font-mono">{tab.label}</span>
        </NavLink>
      ))}
    </div>
  );
};
`,
  'src/components/layout/Shell.tsx': `
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { NextActionBar } from './NextActionBar';
import { StatusLine } from './StatusLine';
import { TabBar } from './TabBar';
import { ToastContainer } from '../ui/Toast';

export const Shell = () => {
  return (
    <div className="min-h-screen flex flex-col pb-14 md:pb-8">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-panel p-4 border border-border">Skip to content</a>
      <Header />
      <NextActionBar />
      <main id="main" className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6">
        <Outlet />
      </main>
      <StatusLine />
      <TabBar />
      <ToastContainer />
    </div>
  );
};
`,
  'src/pages/Dev.tsx': `
import React, { useState } from 'react';
import { Button, Tag, StatusPill, DifficultyDot, Card, Tabs, Modal, Skeleton, EmptyState, ProgressBar, CountUp, Countdown, Kbd, CommitLine, ChallengeCover, toast } from '../components/ui';
import { Search } from 'lucide-react';
import { usePageTitle } from '../hooks';

export default function Dev() {
  usePageTitle('Dev UI');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  return (
    <div className="space-y-12 pb-24">
      <h1 className="text-3xl font-mono font-bold">UI Primitives</h1>
      
      <section className="space-y-4">
        <h2 className="text-xl font-mono">Buttons</h2>
        <div className="flex gap-4 items-center">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-mono">Indicators</h2>
        <div className="flex gap-4 items-center">
          <Tag>frontend</Tag>
          <StatusPill status="upcoming" />
          <StatusPill status="active" />
          <StatusPill status="completed" />
          <StatusPill status="open" />
          <StatusPill status="in-review" />
          <StatusPill status="merged" />
        </div>
        <div className="flex gap-4 items-center">
          <DifficultyDot diff="easy" />
          <DifficultyDot diff="medium" />
          <DifficultyDot diff="hard" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-mono">Card & Cover</h2>
        <Card className="w-80">
          <ChallengeCover slug="test-challenge" />
          <div className="p-4">
            <h3 className="font-mono font-bold mb-1">Test Challenge</h3>
            <p className="text-sm text-muted">This is a test description.</p>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-mono">Tabs</h2>
        <Tabs tabs={[{id:'1', label:'Active (3)'}, {id:'2', label:'Completed (1)'}]} active={activeTab} onChange={setActiveTab} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-mono">Modal & Toasts</h2>
        <div className="flex gap-4">
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          <Button onClick={() => toast({ type: 'success', message: 'Task completed successfully!' })}>Success Toast</Button>
          <Button onClick={() => toast({ type: 'error', message: 'Failed to save.' })}>Error Toast</Button>
          <Button onClick={() => toast({ type: 'info', message: 'Did you know?' })}>Info Toast</Button>
        </div>
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Test Modal">
          <p className="mb-4 text-muted">This is a focus-trapped modal.</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setModalOpen(false)}>Confirm</Button>
          </div>
        </Modal>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-mono">Loaders & States</h2>
        <Skeleton className="w-full h-24" />
        <EmptyState icon={Search} message="No results found." action={<Button variant="secondary">Clear</Button>} />
        <div className="max-w-md">
          <ProgressBar progress={65} />
          <p className="text-xs text-muted mt-2 font-mono">65% to next level</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-mono">Values</h2>
        <div className="font-mono">
          XP: <CountUp value={1200} /> <br/>
          Deadline: <Countdown to={Date.now() + 100000000} />
        </div>
        <p>Press <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> to search.</p>
        <CommitLine entry={{ id: 'a3f9c21', actor: 'Rutvi', verb: 'merged', challengeSlug: 'regex-roll-number', at: Date.now(), xp: 150 }} />
      </section>
    </div>
  );
}
`,
  'src/pages/Placeholder.tsx': `
import React from 'react';
import { usePageTitle } from '../hooks';

export const Placeholder = ({ title }: { title: string }) => {
  usePageTitle(title);
  return (
    <div className="py-12">
      <h1 className="text-3xl font-mono font-bold mb-4">{title}</h1>
      <p className="text-muted">This page is a placeholder.</p>
    </div>
  );
};
`,
  'src/pages/NotFound.tsx': `
import React from 'react';
import { usePageTitle } from '../hooks';
import { Link, useLocation } from 'react-router-dom';

export default function NotFound() {
  usePageTitle('Not Found');
  const location = useLocation();
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-4xl font-mono font-bold text-danger mb-4">404</h1>
      <p className="text-muted font-mono mb-8">fatal: pathspec '{location.pathname}' did not match any files</p>
      <Link to="/" className="text-accent hover:underline font-mono">git checkout main</Link>
    </div>
  );
}
`,
  'src/App.tsx': `
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import Dev from './pages/Dev';
import NotFound from './pages/NotFound';
import { Placeholder } from './pages/Placeholder';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<Placeholder title="Arena" />} />
          <Route path="daily" element={<Placeholder title="Daily Commit" />} />
          <Route path="progress" element={<Placeholder title="My Progress" />} />
          <Route path="leaderboard" element={<Placeholder title="League" />} />
          <Route path="gallery" element={<Placeholder title="Gallery" />} />
          <Route path="organizer" element={<Placeholder title="Organizer" />} />
          <Route path="dev" element={<Dev />} />
          <Route path="404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
`
};

for (const [filepath, content] of Object.entries(files)) {
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, content.trim() + '\\n');
  console.log('Created', filepath);
}
