import { useMemo } from 'react';
import { GitCommit } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useNow } from '../../hooks';
import { challenges } from '../../data/challenges';
import { earnedXp, streak, activeDays, getLevel } from '../../lib/xp';
import { SEED_HEATMAP_OFFSETS } from '../../data';

export const StatusLine = () => {
  const { submissions, dailyResults, settings } = useStore();
  const now = useNow(60_000);

  const xp = earnedXp(submissions, challenges, dailyResults, now, settings.demoAutoMerge);
  const currentLevel = getLevel(xp);
  const days = useMemo(
    () => activeDays(submissions, challenges, dailyResults, SEED_HEATMAP_OFFSETS, now, settings.demoAutoMerge),
    [submissions, dailyResults, now, settings.demoAutoMerge]
  );
  const currentStreak = streak(days);

  return (
    <div className="hidden md:flex fixed bottom-0 left-0 right-0 h-8 bg-panel border-t border-border items-center justify-between px-4 font-mono text-xs text-muted z-40">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1 text-text"><GitCommit className="w-3 h-3" /> main</span>
        <span>{currentLevel.name}</span>
        <span>{xp} XP</span>
        <span>streak {currentStreak}</span>
      </div>
      <div>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-text">Git Club CHARUSAT</a>
      </div>
    </div>
  );
};
