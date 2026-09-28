import type { ActivityEntry } from '../../types';

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
