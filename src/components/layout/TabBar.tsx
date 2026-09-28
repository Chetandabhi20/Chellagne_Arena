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
