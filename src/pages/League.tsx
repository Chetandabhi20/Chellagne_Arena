import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { challenges as seedChallenges } from '../data/challenges';
import { participants } from '../data/participants';
import { SEED_HEATMAP_OFFSETS } from '../data';
import {
  earnedXp,
  weeklyXp,
  activeDays,
  streak,
  getTier
} from '../lib/xp';
import type { Tier } from '../lib/xp';
import { usePageTitle, useNow } from '../hooks';
import { Medal, Flame } from 'lucide-react';
import { cn } from '../lib/cn';

function TierBadge({ tier }: { tier: Tier }) {
  if (tier === 'Bronze') return <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-panel-2 border border-border text-muted">Bronze</span>;
  if (tier === 'Silver') return <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-panel-2 border border-border text-text">Silver</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-panel-2 border border-warning text-warning">Gold</span>;
}

export default function League() {
  usePageTitle('League');
  const store = useStore();
  const now = useNow(60_000);
  const [searchParams, setSearchParams] = useSearchParams();
  const range = searchParams.get('range') === 'all' ? 'all' : 'week';
  const filterBranch = searchParams.get('branch');
  const filterYear = searchParams.get('year');

  const allChallenges = useMemo(() => [...seedChallenges, ...store.customChallenges], [store.customChallenges]);

  const rankings = useMemo(() => {
    const days = activeDays(store.submissions, allChallenges, store.dailyResults, SEED_HEATMAP_OFFSETS, now, store.settings.demoAutoMerge);
    const myStreak = streak(days, now);
    const myTotalXp = earnedXp(store.submissions, allChallenges, store.dailyResults, now, store.settings.demoAutoMerge);
    const myWeeklyXp = weeklyXp(store.submissions, allChallenges, store.dailyResults, now, store.settings.demoAutoMerge);

    const all = [
      ...participants.map((p) => ({
        id: p.id,
        name: p.name,
        branch: p.branch,
        year: p.year,
        streak: p.streak,
        xp: range === 'week' ? p.weeklyXp : p.allTimeXp,
        isYou: false,
      })),
      {
        id: store.profile.id,
        name: store.profile.name,
        branch: store.profile.branch,
        year: store.profile.year,
        streak: myStreak,
        xp: range === 'week' ? myWeeklyXp : myTotalXp,
        isYou: true,
      }
    ];

    let filtered = all;
    if (filterBranch) filtered = filtered.filter(p => p.branch === filterBranch);
    if (filterYear) filtered = filtered.filter(p => p.year.toString() === filterYear);

    filtered.sort((a, b) => {
      if (b.xp !== a.xp) return b.xp - a.xp;
      return a.name.localeCompare(b.name);
    });

    return filtered.map((e, i) => ({
      ...e,
      rank: i + 1,
      tier: getTier(range === 'week' ? e.xp : (e.isYou ? myTotalXp : participants.find(p=>p.id===e.id)!.allTimeXp)),
    }));
  }, [store, allChallenges, now, range, filterBranch, filterYear]);

  const top3 = rankings.slice(0, 3);
  const rest = rankings.slice(3);

  const myIndex = rankings.findIndex(r => r.isYou);
  const showPinnedYou = myIndex >= 10;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-mono font-bold text-text">League</h1>
          <p className="text-muted mt-1">Season 1 · ends in 26 days</p>
        </div>
        <div className="flex gap-2 bg-panel-2 p-1 rounded-lg border border-border">
          <button
            onClick={() => setSearchParams(prev => { prev.set('range', 'week'); return prev; }, { replace: true })}
            className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-colors", range === 'week' ? "bg-panel text-text shadow-sm" : "text-muted hover:text-text")}
          >
            This week
          </button>
          <button
            onClick={() => setSearchParams(prev => { prev.set('range', 'all'); return prev; }, { replace: true })}
            className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-colors", range === 'all' ? "bg-panel text-text shadow-sm" : "text-muted hover:text-text")}
          >
            All time
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <select
          value={filterBranch || ''}
          onChange={(e) => setSearchParams(prev => { if(e.target.value) prev.set('branch', e.target.value); else prev.delete('branch'); return prev; })}
          className="bg-panel border border-border rounded-md px-3 py-1.5 text-sm"
        >
          <option value="">All Branches</option>
          <option value="CE">CE</option>
          <option value="IT">IT</option>
          <option value="CSE">CSE</option>
          <option value="EC">EC</option>
        </select>
        <select
          value={filterYear || ''}
          onChange={(e) => setSearchParams(prev => { if(e.target.value) prev.set('year', e.target.value); else prev.delete('year'); return prev; })}
          className="bg-panel border border-border rounded-md px-3 py-1.5 text-sm"
        >
          <option value="">All Years</option>
          <option value="1">Year 1</option>
          <option value="2">Year 2</option>
          <option value="3">Year 3</option>
          <option value="4">Year 4</option>
        </select>
      </div>

      {top3.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {top3.map((p, i) => (
            <motion.div layoutId={p.id} key={p.id} className={cn("bg-panel border border-border rounded-lg p-4 flex flex-col items-center text-center", p.isYou && "border-l-4 border-l-success")}>
              <div className="w-10 h-10 rounded-full bg-panel-2 border border-border flex items-center justify-center font-mono font-bold mb-2">
                {i === 0 ? <Medal className="w-5 h-5 text-warning" /> : i + 1}
              </div>
              <div className="font-bold text-text truncate w-full">{p.name}</div>
              <div className="text-xs text-muted font-mono truncate w-full">{p.id} · {p.branch} · Yr {p.year}</div>
              <div className="mt-3 font-mono font-bold text-accent">{p.xp} XP</div>
              <div className="mt-2"><TierBadge tier={p.tier} /></div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="bg-panel rounded-lg border border-border overflow-hidden relative">
        <div className="flex px-4 py-3 border-b border-border text-xs font-mono text-muted uppercase tracking-wider">
          <div className="w-12">Rank</div>
          <div className="flex-1">Participant</div>
          <div className="w-24 text-center hidden sm:block">Streak</div>
          <div className="w-24 text-right">XP</div>
        </div>
        <div className="divide-y divide-border">
          {rest.map((p) => (
             <motion.div layoutId={p.id} key={p.id} className={cn("flex items-center px-4 py-3 hover:bg-panel-2 transition-colors", p.isYou && "bg-panel-2 border-l-4 border-l-success pl-3")}>
               <div className="w-12 font-mono font-bold text-muted">#{p.rank}</div>
               <div className="flex-1 min-w-0 pr-4">
                 <div className="flex items-center gap-2">
                   <div className="font-bold text-text truncate">{p.name}</div>
                   <TierBadge tier={p.tier} />
                 </div>
                 <div className="text-xs text-muted font-mono truncate">{p.id} · {p.branch} · Yr {p.year}</div>
               </div>
               <div className="w-24 justify-center hidden sm:flex items-center gap-1 font-mono text-sm">
                 {p.streak > 0 ? <><Flame className="w-4 h-4 text-accent" />{p.streak}</> : '-'}
               </div>
               <div className="w-24 text-right font-mono font-bold">{p.xp}</div>
             </motion.div>
          ))}
          {rest.length === 0 && <div className="p-8 text-center text-muted">No participants found.</div>}
        </div>
        
        {showPinnedYou && (
          <div className="sticky bottom-0 bg-panel-2 border-t-2 border-success border-l-4 border-l-success pl-3 flex items-center px-4 py-3 shadow-lg z-10">
               <div className="w-12 font-mono font-bold text-muted">#{rankings[myIndex].rank}</div>
               <div className="flex-1 min-w-0 pr-4">
                 <div className="flex items-center gap-2">
                   <div className="font-bold text-text truncate">{rankings[myIndex].name}</div>
                   <TierBadge tier={rankings[myIndex].tier} />
                 </div>
                 <div className="text-xs text-muted font-mono truncate">{rankings[myIndex].id} · {rankings[myIndex].branch} · Yr {rankings[myIndex].year}</div>
               </div>
               <div className="w-24 justify-center hidden sm:flex items-center gap-1 font-mono text-sm">
                 {rankings[myIndex].streak > 0 ? <><Flame className="w-4 h-4 text-accent" />{rankings[myIndex].streak}</> : '-'}
               </div>
               <div className="w-24 text-right font-mono font-bold">{rankings[myIndex].xp}</div>
          </div>
        )}
      </div>
    </div>
  );
}
