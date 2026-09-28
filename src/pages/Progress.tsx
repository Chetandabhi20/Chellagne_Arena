import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { challenges as seedChallenges } from '../data/challenges';
import { SEED_HEATMAP_OFFSETS } from '../data';
import { deriveBadges, BADGE_DEFS } from '../lib/badges';
import { earnedXp, activeDays, streak, getLevel, xpToNextLevel, levelProgress, computeRankings } from '../lib/xp';
import { prState, attemptsLeft } from '../lib/selectors';
import { formatRelative, dateKey } from '../lib/time';
import { usePageTitle, useNow } from '../hooks';
import { Flame, Trophy, Lock, Rocket, GitPullRequest, GitMerge, Regex, Palette, Bug, Sunrise, FlameKindling, CalendarCheck, Medal } from 'lucide-react';
import { Button, StatusPill, EmptyState, ProgressBar } from '../components/ui';
import { participants } from '../data/participants';
import { cn } from '../lib/cn';

const XPChart = React.lazy(() => import('../components/XPChart'));

const ICON_MAP: Record<string, any> = {
  'git-merge': GitMerge,
  'trophy': Trophy,
  'regex': Regex,
  'palette': Palette,
  'bug': Bug,
  'sunrise': Sunrise,
  'flame': Flame,
  'flame-kindling': FlameKindling,
  'calendar-check': CalendarCheck,
  'medal': Medal
};

export default function Progress() {
  usePageTitle('My Progress');
  const store = useStore();
  const now = useNow(60_000);

  const allChallenges = useMemo(() => [...seedChallenges, ...store.customChallenges], [store.customChallenges]);
  
  const xp = earnedXp(store.submissions, allChallenges, store.dailyResults, now, store.settings.demoAutoMerge);
  const level = getLevel(xp);
  const toNext = xpToNextLevel(xp);
  const progress = levelProgress(xp);
  
  const days = activeDays(store.submissions, allChallenges, store.dailyResults, SEED_HEATMAP_OFFSETS, now, store.settings.demoAutoMerge);
  const currentStreak = streak(days, now);

  const rankings = computeRankings(participants, {
    id: store.profile.id,
    name: store.profile.name,
    xp,
    weeklyXp: 0,
    streak: currentStreak,
    branch: store.profile.branch,
    year: store.profile.year,
  });
  const myRank = rankings.find(r => r.isYou)?.rank ?? 0;

  const badgeStates = deriveBadges({
    submissions: store.submissions,
    challenges: allChallenges,
    currentStreak,
    dailyCount: store.dailyResults.length,
    rank: myRank,
    now,
    demoAutoMerge: store.settings.demoAutoMerge
  });

  const prs = store.submissions
    .filter(s => s.result.passed && !s.practice)
    .sort((a,b) => b.openedAt - a.openedAt)
    .map(s => {
      const c = allChallenges.find(ch => ch.id === s.challengeId);
      return { s, c, pr: c ? prState(s, c.type, now, store.settings.demoAutoMerge) : null };
    })
    .filter(x => x.c && x.pr);

  const inProgress = allChallenges
    .filter(c => store.checkouts[c.id])
    .filter(c => {
       const best = store.submissions.find(s => s.challengeId === c.id && s.result.passed && !s.practice);
       return !best || (prState(best, c.type, now, store.settings.demoAutoMerge) !== 'merged');
    });

  // Heatmap generation
  const today = new Date(now);
  today.setHours(0,0,0,0);
  const todayMs = today.getTime();
  
  // 16 weeks * 7 days = 112 days
  const heatmapDays = Array.from({length: 112}).map((_, i) => {
    const dayMs = todayMs - (111 - i) * 86400000;
    const dk = dateKey(dayMs);
    let intensity = 0;
    if (days.has(dk)) {
      let count = 0;
      if (store.dailyResults.some(r => r.dateKey === dk)) count++;
      count += store.submissions.filter(s => dateKey(s.openedAt) === dk).length;
      if (SEED_HEATMAP_OFFSETS.map(o => dateKey(todayMs + o * 86400000)).includes(dk)) count++;
      intensity = Math.min(3, count);
    }
    return { date: new Date(dayMs), intensity, dk };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-mono font-bold text-text">My Progress</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-panel border border-border rounded-lg p-6 space-y-4 col-span-1">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-text">{store.profile.name}</h2>
              <p className="font-mono text-muted text-sm">{store.profile.id} · {store.profile.branch} · Yr {store.profile.year}</p>
            </div>
            <div className="w-12 h-12 bg-panel-2 rounded-full border border-border flex items-center justify-center font-mono font-bold text-accent shadow-sm">
              {store.profile.name.substring(0,2).toUpperCase()}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <div className="text-xs text-muted font-mono uppercase">Rank</div>
              <div className="font-bold font-mono text-lg flex items-center gap-1">#{myRank}</div>
            </div>
            <div>
              <div className="text-xs text-muted font-mono uppercase">Streak</div>
              <div className="font-bold font-mono text-lg flex items-center gap-1">
                <Flame className={cn("w-4 h-4", currentStreak > 0 ? "text-accent" : "text-muted")} /> {currentStreak}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-panel border border-border rounded-lg p-6 space-y-4 col-span-1 md:col-span-2 flex flex-col justify-center relative overflow-hidden">
          <div className="flex justify-between items-end mb-2">
            <div>
              <div className="text-sm font-mono text-muted uppercase">Current Level</div>
              <div className="text-2xl font-bold text-text">{level.name}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-mono text-muted uppercase">Total XP</div>
              <div className="text-2xl font-mono font-bold text-accent">{xp}</div>
            </div>
          </div>
          <ProgressBar progress={progress * 100} className="h-3 rounded-full" />
          <div className="text-sm text-muted font-mono">
            {toNext > 0 ? <>{toNext} XP to next level</> : "Max level reached!"}
          </div>
          <Trophy className="absolute -right-4 -bottom-4 w-32 h-32 text-border opacity-20 pointer-events-none" />
        </div>
      </div>

      <div className="bg-panel border border-border rounded-lg p-6 overflow-x-auto">
        <h3 className="font-mono font-bold text-text mb-4 flex items-center justify-between">
          <span>Contributions</span>
        </h3>
        <div className="flex gap-1 min-w-max">
          {Array.from({length: 16}).map((_, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-1">
              {Array.from({length: 7}).map((_, rowIndex) => {
                const day = heatmapDays[colIndex * 7 + rowIndex];
                if (!day) return <div key={rowIndex} className="w-3 h-3" />;
                const bg = day.intensity === 0 ? 'bg-panel-2' 
                         : day.intensity === 1 ? 'bg-success/35'
                         : day.intensity === 2 ? 'bg-success/65'
                         : 'bg-success';
                return (
                  <div 
                    key={rowIndex} 
                    className={cn("w-3 h-3 rounded-sm border border-border/50", bg)}
                    title={`${day.intensity > 0 ? day.intensity + ' contributions' : 'No contributions'} on ${day.date.toLocaleDateString()}`}
                    aria-label={`${day.intensity > 0 ? day.intensity + ' contributions' : 'No contributions'} on ${day.date.toLocaleDateString()}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-panel border border-border rounded-lg p-6">
          <h3 className="font-mono font-bold text-text mb-4">Badges</h3>
          <div className="grid grid-cols-2 gap-3">
            {badgeStates.map(b => {
              const def = BADGE_DEFS.find(d => d.id === b.id)!;
              const IconComp = ICON_MAP[def.icon] || Trophy;
              return (
                <div key={b.id} className={cn("flex flex-col p-3 rounded-md border text-sm transition-all", b.earned ? "border-success bg-success/10 text-success" : "border-border bg-panel-2 text-muted opacity-60")}>
                  <div className="font-bold flex items-center justify-between">
                    <span className="flex items-center gap-2"><IconComp className="w-4 h-4" /> {def.name}</span>
                  </div>
                  <div className="text-xs font-mono mt-1">{def.description}</div>
                  {!b.earned && <Lock className="w-3 h-3 mt-2 self-end" />}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="bg-panel border border-border rounded-lg p-6 flex flex-col">
          <h3 className="font-mono font-bold text-text mb-4">XP History</h3>
          <div className="flex-1 min-h-[200px] flex items-center justify-center">
            <React.Suspense fallback={<div className="text-muted font-mono text-sm animate-pulse">Loading chart...</div>}>
               <XPChart submissions={store.submissions} dailyResults={store.dailyResults} challenges={allChallenges} now={now} demoAutoMerge={store.settings.demoAutoMerge} />
            </React.Suspense>
          </div>
        </div>
      </div>

      <div className="bg-panel border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border font-mono font-bold text-text flex items-center gap-2">
          <GitPullRequest className="w-5 h-5" /> Pull Requests
        </div>
        {prs.length === 0 ? (
          <EmptyState icon={GitPullRequest} message="No pull requests yet. Check out a challenge to open your first PR." action={<Link to="/"><Button variant="primary">Go to Arena</Button></Link>} />
        ) : (
          <div className="divide-y divide-border">
            {prs.map(({s, c, pr}) => (
              <Link key={s.id} to={`/challenges/${c?.slug}`} className="flex items-center justify-between p-4 hover:bg-panel-2 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="text-muted font-mono">#{s.prNumber}</div>
                  <div>
                    <div className="font-bold text-text group-hover:text-accent transition-colors">{c?.title}</div>
                    <div className="text-xs font-mono text-muted">{formatRelative(s.openedAt, now)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-mono font-bold text-accent hidden sm:block">+{s.awardedXp} XP</div>
                  <StatusPill label={pr === 'merged' ? 'Merged' : pr === 'in-review' ? 'In review' : 'Open'} variant={pr === 'merged' ? 'success' : pr === 'in-review' ? 'warning' : 'blue'} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {inProgress.length > 0 && (
        <div className="bg-panel border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border font-mono font-bold text-text flex items-center gap-2">
            <Rocket className="w-5 h-5" /> In Progress
          </div>
          <div className="divide-y divide-border">
            {inProgress.map(c => {
               const checkout = store.checkouts[c.id];
               const left = attemptsLeft(c.maxAttempts, checkout.attemptsUsed);
               return (
                 <Link key={c.id} to={`/challenges/${c.slug}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-panel-2 transition-colors group gap-2">
                    <div>
                      <div className="font-bold text-text group-hover:text-accent transition-colors">{c.title}</div>
                      <div className="text-xs font-mono text-muted">Closes {formatRelative(new Date(c.closesAt).getTime(), now)}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      {left !== null && <div className="text-sm font-mono text-muted">{left} attempts left</div>}
                      <Button variant="secondary" size="sm">Resume</Button>
                    </div>
                 </Link>
               );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
