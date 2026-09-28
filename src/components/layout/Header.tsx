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
