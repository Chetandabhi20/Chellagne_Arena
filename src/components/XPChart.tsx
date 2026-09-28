import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Submission, DailyResult, Challenge } from '../types';
import { prState } from '../lib/selectors';
import { dateKey } from '../lib/time';
import { YOU_BASE_XP } from '../data/participants';

interface XPChartProps {
  submissions: Submission[];
  dailyResults: DailyResult[];
  challenges: Challenge[];
  now: number;
  demoAutoMerge: boolean;
}

export default function XPChart({ submissions, dailyResults, challenges, now, demoAutoMerge }: XPChartProps) {
  const data = useMemo(() => {
    // We want a 14-day history
    const days: { date: Date, dk: string, xp: number }[] = [];
    const today = new Date(now);
    today.setHours(0,0,0,0);
    
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86400000);
      days.push({ date: d, dk: dateKey(d.getTime()), xp: YOU_BASE_XP }); // Start with base XP
    }

    // Best passing non-practice submission per challenge, accumulated
    // We need to accumulate XP up to that day
    const bestSubs = new Map<string, Submission>();
    for (const s of submissions) {
      if (!s.result.passed || s.practice) continue;
      const c = challenges.find((ch) => ch.id === s.challengeId);
      if (!c) continue;
      if (prState(s, c.type, now, demoAutoMerge) === 'merged') {
        const existing = bestSubs.get(c.id);
        if (!existing || s.awardedXp > existing.awardedXp) {
          bestSubs.set(c.id, s);
        }
      }
    }

    for (const d of days) {
      const dayEndMs = d.date.getTime() + 86400000;
      
      // add merged PRs up to this day
      for (const s of bestSubs.values()) {
        if (s.openedAt < dayEndMs) {
          d.xp += s.awardedXp;
        }
      }
      
      // add daily results up to this day
      for (const r of dailyResults) {
        if (new Date(r.dateKey).getTime() < dayEndMs) {
           d.xp += 20 + (r.correct === r.total ? 10 : 0);
        }
      }
    }

    return days.map(d => ({
      name: d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      XP: d.xp
    }));
  }, [submissions, dailyResults, challenges, now, demoAutoMerge]);

  return (
    <div className="w-full h-full min-h-[200px]" role="img" aria-label="Line chart showing cumulative XP over the last 14 days">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis 
            dataKey="name" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: 'var(--muted)', fontSize: 12, fontFamily: 'monospace' }} 
            dy={10}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: 'var(--muted)', fontSize: 12, fontFamily: 'monospace' }} 
            width={40}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--panel)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text)' }}
            itemStyle={{ color: 'var(--accent)', fontFamily: 'monospace' }}
            labelStyle={{ color: 'var(--muted)', marginBottom: '4px' }}
          />
          <Line 
            type="monotone" 
            dataKey="XP" 
            stroke="var(--accent)" 
            strokeWidth={2} 
            dot={false}
            activeDot={{ r: 6, fill: 'var(--panel)', stroke: 'var(--accent)', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
