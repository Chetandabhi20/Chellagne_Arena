import { Link } from 'react-router-dom';
import { ChallengeCover, Tag, DifficultyDot, StatusPill } from './index';
import type { Challenge, Submission } from '../../types';
import { challengeStatus, prState, bestSubmission, attemptsLeft } from '../../lib/selectors';
import { formatRelative } from '../../lib/time';

interface ChallengeCardProps {
  challenge: Challenge;
  submissions: Submission[];
  checkout?: { at: number; attemptsUsed: number };
  demoAutoMerge: boolean;
  now?: number;
}

export function ChallengeCard({ challenge, submissions, checkout, demoAutoMerge, now = Date.now() }: ChallengeCardProps) {
  const status = challengeStatus(challenge, now);
  const bestSub = bestSubmission(submissions, challenge.id);
  const state = bestSub ? prState(bestSub, challenge.type, now, demoAutoMerge) : null;
  
  // Determine Your Status
  let yourStatus: 'Not started' | 'In progress' | 'Submitted' | 'Merged' = 'Not started';
  if (state === 'merged') yourStatus = 'Merged';
  else if (state === 'open' || state === 'in-review') yourStatus = 'Submitted';
  else if (checkout) yourStatus = 'In progress';

  // Attempts text
  let attemptsText = '';
  if (yourStatus === 'In progress' && checkout) {
    const left = attemptsLeft(challenge.maxAttempts, checkout.attemptsUsed);
    if (left !== null) attemptsText = ` (${left} attempt${left !== 1 ? 's' : ''} left)`;
  }

  // Primary action label
  let actionLabel = 'View challenge';
  if (status === 'upcoming') actionLabel = 'Preview';
  else if (yourStatus === 'Merged') actionLabel = 'Review';
  else if (yourStatus === 'Submitted') actionLabel = 'View PR';
  else if (yourStatus === 'In progress') actionLabel = 'Resume';

  // Deadline string
  let deadlineStr = '';
  if (status === 'active') {
    deadlineStr = `Closes ${formatRelative(new Date(challenge.closesAt).getTime(), now)}`;
  } else if (status === 'upcoming') {
    deadlineStr = `Opens ${formatRelative(new Date(challenge.opensAt).getTime(), now)}`;
  } else {
    const d = new Date(challenge.closesAt);
    deadlineStr = `Closed ${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })}`;
  }

  // Visible tags (max 3)
  const visibleTags = challenge.tags.slice(0, 3);
  const hiddenTags = challenge.tags.length - 3;

  return (
    <Link 
      to={`/challenges/${challenge.slug}`} 
      className={`group relative flex flex-col bg-panel rounded-xl overflow-hidden border border-border transition-colors hover:border-muted focus-ring ${status === 'upcoming' ? 'opacity-70' : ''}`}
    >
      <ChallengeCover slug={challenge.slug} size="sm" />
      
      <div className="flex flex-col flex-grow p-4 gap-4">
        {/* Header */}
        <div>
          <h3 className="font-mono text-lg font-bold text-text truncate mb-1">
            {challenge.title}
          </h3>
          <p className="text-sm text-muted line-clamp-2">
            {challenge.tagline}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {visibleTags.map(tag => (
            <Tag key={tag} label={tag} />
          ))}
          {hiddenTags > 0 && <Tag label={`+${hiddenTags}`} />}
        </div>

        <div className="flex-grow" />

        {/* Meta Row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted mb-4">
          <Tag label={challenge.category} variant="blue" />
          <div className="flex items-center gap-1.5 capitalize">
            <DifficultyDot difficulty={challenge.difficulty} />
            {challenge.difficulty}
          </div>
          <span className="capitalize">{challenge.type}</span>
          <span className="font-mono font-bold text-accent">+{challenge.points} XP</span>
          <span>{deadlineStr}</span>
        </div>

        {/* Status & Action */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <StatusPill 
              label={yourStatus} 
              variant={yourStatus === 'Merged' ? 'success' : yourStatus === 'Submitted' ? 'warning' : yourStatus === 'In progress' ? 'blue' : 'neutral'} 
            />
            {attemptsText && <span className="text-xs text-muted">{attemptsText}</span>}
          </div>
          
          <span className="inline-flex items-center justify-center h-8 px-3 text-sm font-mono font-medium rounded bg-panel-2 text-text group-hover:bg-panel-3 transition-colors">
            {actionLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
