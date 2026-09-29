import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { challenges, seedActivity } from '../data';
import { challengeStatus } from '../lib/selectors';
import { earnedXp } from '../lib/xp';
import { formatRelative } from '../lib/time';
import { useNow } from '../hooks';
import { commitHash } from '../lib/hash';
import { 
  Button, 
  Tabs, 
  ChallengeCard, 
  Modal, 
  Skeleton, 
  EmptyState 
} from '../components/ui';
import { Flame, Info } from 'lucide-react';
import type { Challenge } from '../types';

export default function Arena() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Global State
  const { 
    submissions, 
    checkouts, 
    dailyResults, 
    activity, 
    settings,
    customChallenges
  } = useStore();

  const allChallenges = useMemo(() => [...challenges, ...(customChallenges || [])], [customChallenges]);

  // On mount simulate network delay for skeleton (300ms) per SPEC
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const now = useNow(60000);

  // Read URL params
  const statusParam = searchParams.get('status') || 'active';
  const sortParam = searchParams.get('sort') || 'closing';
  const diffParam = searchParams.get('diff') || 'all';
  const typeParam = searchParams.get('type') || 'all';
  const qParam = (searchParams.get('q') || '').toLowerCase();

  // Update params helper
  const updateParam = (key: string, value: string) => {
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      if (value === 'all' || value === 'active' && key === 'status') {
        p.delete(key);
      } else {
        p.set(key, value);
      }
      return p;
    }, { replace: true });
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const hasFilters = diffParam !== 'all' || typeParam !== 'all' || qParam !== '';

  // Filter challenges
  const activeCount = allChallenges.filter((c: Challenge) => challengeStatus(c, now) === 'active').length;
  const upcomingCount = allChallenges.filter((c: Challenge) => challengeStatus(c, now) === 'upcoming').length;
  const completedCount = allChallenges.filter((c: Challenge) => challengeStatus(c, now) === 'completed').length;

  const filteredChallenges = useMemo(() => {
    return allChallenges.filter((c: Challenge) => {
      const st = challengeStatus(c, now);
      if (statusParam !== 'all' && st !== statusParam) return false;
      if (diffParam !== 'all' && c.difficulty !== diffParam) return false;
      if (typeParam !== 'all' && c.type !== typeParam) return false;
      if (qParam) {
        if (!c.title.toLowerCase().includes(qParam) &&
            !c.category.toLowerCase().includes(qParam) &&
            !c.tags.some((t: string) => t.toLowerCase().includes(qParam))) {
          return false;
        }
      }
      return true;
    }).sort((a: Challenge, b: Challenge) => {
      if (sortParam === 'newest') return new Date(b.opensAt).getTime() - new Date(a.opensAt).getTime();
      if (sortParam === 'points') return b.points - a.points;
      // Default: closing (soonest closes first, then opens soonest for upcoming)
      const aClose = new Date(a.closesAt).getTime();
      const bClose = new Date(b.closesAt).getTime();
      if (aClose === bClose) return new Date(a.opensAt).getTime() - new Date(b.opensAt).getTime();
      return aClose - bClose;
    });
  }, [statusParam, diffParam, typeParam, qParam, sortParam, now, allChallenges]);

  // Hero Stats
  const activeChallenges = allChallenges.filter((c: Challenge) => challengeStatus(c, now) === 'active');
  const soonest = [...activeChallenges].sort((a, b) => new Date(a.closesAt).getTime() - new Date(b.closesAt).getTime())[0];
  const participantsCount = 18 + 1; // 18 seeds + you
  const thisWeekXp = earnedXp(submissions, allChallenges, dailyResults, now, settings.demoAutoMerge); // simplification for hero stat

  // Recent Activity
  const combinedActivity = useMemo(() => {
    return [...seedActivity, ...activity].sort((a, b) => b.at - a.at).slice(0, 6);
  }, [activity]);

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row gap-8 items-start justify-between">
        <div className="flex-1 space-y-6">
          <h1 className="font-mono text-3xl md:text-4xl font-bold text-text">
            <span className="text-accent">$</span> git checkout -b your-next-challenge<span className="animate-pulse">_</span>
          </h1>
          <p className="text-muted text-lg max-w-xl">
            Weekly challenges from Git Club CHARUSAT. Solve them in your browser, open a pull request, earn XP.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="primary" onClick={() => document.getElementById('grid')?.scrollIntoView({ behavior: 'smooth' })}>
              Browse active challenges
            </Button>
            <Button variant="ghost" onClick={() => setHowItWorksOpen(true)}>
              How it works
            </Button>
          </div>
        </div>

        <div className="w-full md:w-80 flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-px bg-border border border-border rounded-lg overflow-hidden">
            <div className="bg-panel p-3 text-center">
              <div className="font-mono text-2xl font-bold">{activeCount}</div>
              <div className="text-xs text-muted">Active</div>
            </div>
            <div className="bg-panel p-3 text-center">
              <div className="font-mono text-2xl font-bold">{participantsCount}</div>
              <div className="text-xs text-muted">Hackers</div>
            </div>
            <div className="bg-panel p-3 text-center">
              <div className="font-mono text-2xl font-bold text-accent">{thisWeekXp}</div>
              <div className="text-xs text-muted">XP merged</div>
            </div>
          </div>
          
          {soonest && (
            <div className="text-sm font-mono text-muted text-center">
              Closes {formatRelative(new Date(soonest.closesAt).getTime(), now)} · {soonest.title}
            </div>
          )}

          {/* Daily Commit Tile */}
          <div className="bg-panel-2 border border-border rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-panel-3 p-2 rounded text-accent">
                <Flame size={20} />
              </div>
              <div>
                <div className="font-bold text-text text-sm">Daily Commit</div>
                <div className="text-xs text-muted">3 questions · +20 XP</div>
              </div>
            </div>
            <Button size="sm" onClick={() => navigate('/daily')}>
              Play
            </Button>
          </div>
        </div>
      </section>

      {/* Tabs and Filters */}
      <section id="grid" className="space-y-6 pt-4 scroll-mt-24">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <Tabs 
            active={statusParam}
            onChange={(id) => updateParam('status', id)}
            tabs={[
              { id: 'active', label: `Active (${activeCount})` },
              { id: 'upcoming', label: `Upcoming (${upcomingCount})` },
              { id: 'completed', label: `Completed (${completedCount})` },
            ]}
          />
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Search challenges..." 
              value={qParam}
              onChange={(e) => updateParam('q', e.target.value)}
              className="px-3 py-1.5 bg-panel border border-border rounded text-sm w-full md:w-64 focus-ring"
            />
            <select
              value={sortParam}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="px-3 py-1.5 bg-panel border border-border rounded text-sm focus-ring"
            >
              <option value="closing">Closing soon</option>
              <option value="newest">Newest first</option>
              <option value="points">Most points</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted font-medium">Difficulty:</span>
          {['all', 'easy', 'medium', 'hard'].map(d => (
            <button 
              key={d}
              onClick={() => updateParam('diff', d)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors focus-ring capitalize ${diffParam === d ? 'bg-accent text-panel font-bold' : 'bg-panel-2 text-muted hover:bg-panel-3'}`}
            >
              {d}
            </button>
          ))}
          
          <span className="text-sm text-muted font-medium ml-4">Type:</span>
          {['all', 'code', 'regex', 'frontend', 'quiz', 'link'].map(t => (
            <button 
              key={t}
              onClick={() => updateParam('type', t)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors focus-ring capitalize ${typeParam === t ? 'bg-accent text-panel font-bold' : 'bg-panel-2 text-muted hover:bg-panel-3'}`}
            >
              {t}
            </button>
          ))}

          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-accent hover:underline ml-auto">
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* Grid */}
      <section>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredChallenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map((c: Challenge) => (
              <ChallengeCard 
                key={c.id} 
                challenge={c} 
                submissions={submissions}
                checkout={checkouts[c.id]}
                demoAutoMerge={settings.demoAutoMerge}
                now={now}
              />
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={Info}
            message="No branches match. Try clearing filters."
            action={<Button onClick={clearFilters}>Clear filters</Button>}
          />
        )}
      </section>

      {/* Activity Feed */}
      <section className="border-t border-border pt-8 mt-12">
        <h3 className="font-mono text-lg font-bold mb-4">Recent Activity</h3>
        <div className="space-y-3 font-mono text-sm">
          {combinedActivity.map((entry, idx) => {
            const hash = commitHash(entry.id);
            const relativeTime = formatRelative(entry.at, now);
            return (
              <div key={entry.id + idx} className="flex gap-4 items-center text-muted">
                <span className="text-accent">{hash}</span>
                <span className="truncate flex-1">
                  <strong className="text-text">{entry.actor}</strong> {entry.verb} {entry.challengeSlug}
                  {entry.xp && <span className="ml-2 font-bold text-success">+{entry.xp} XP</span>}
                </span>
                <span className="whitespace-nowrap">{relativeTime}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Modals */}
      <Modal isOpen={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} title="How it works">
        <div className="space-y-6 text-muted">
          <div className="flex gap-4 items-start">
            <div className="bg-panel-2 w-8 h-8 rounded flex items-center justify-center font-bold text-text shrink-0">1</div>
            <div>
              <strong className="text-text block mb-1">Check out a challenge</strong>
              Browse the arena for active challenges. We drop new ones every week covering Git, JS, CSS, and more.
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="bg-panel-2 w-8 h-8 rounded flex items-center justify-center font-bold text-text shrink-0">2</div>
            <div>
              <strong className="text-text block mb-1">Solve it in the browser</strong>
              Our isolated code runner tests your code instantly. No need to install dependencies or spin up an IDE.
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="bg-panel-2 w-8 h-8 rounded flex items-center justify-center font-bold text-text shrink-0">3</div>
            <div>
              <strong className="text-text block mb-1">Open a pull request</strong>
              Submit your passing code to open a simulated PR. Merged PRs earn you XP to climb the leaderboard!
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <Button variant="primary" onClick={() => setHowItWorksOpen(false)}>Got it</Button>
        </div>
      </Modal>

    </div>
  );
}
