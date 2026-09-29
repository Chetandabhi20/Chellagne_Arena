import { useState, useMemo } from 'react';
import { ExternalLink, Heart, ArrowDownUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import { challenges } from '../data/challenges';
import { gallerySeed } from '../data/gallery';
import { prState } from '../lib/selectors';
import { EmptyState, ChallengeCover, Card, Button } from '../components/ui';
import { usePageTitle, useNow } from '../hooks';
import { cn } from '../lib/cn';

export default function Gallery() {
  usePageTitle('Gallery');
  const store = useStore();
  const now = useNow();
  const profileId = store.profile.id;
  const [sortBy, setSortBy] = useState<'votes' | 'newest'>('votes');

  // Find gallery challenges
  const galleryChallenges = useMemo(() => {
    return [...challenges, ...store.customChallenges].filter((c) => c.gallery);
  }, [store.customChallenges]);

  const items = useMemo(() => {
    const list: {
      id: string;
      challengeTitle: string;
      slug: string;
      author: string;
      note: string;
      url: string;
      votes: number;
      hasVoted: boolean;
      timestamp: number;
    }[] = [];

    // Add seed data
    gallerySeed.forEach((seed) => {
      const challenge = galleryChallenges.find((c) => c.slug === seed.challengeSlug);
      if (!challenge) return;
      const userVotes = store.upvotes[seed.id] || [];
      const hasVoted = userVotes.includes(profileId);
      list.push({
        id: seed.id,
        challengeTitle: challenge.title,
        slug: challenge.slug,
        author: seed.authorName,
        note: seed.note,
        url: seed.url,
        votes: seed.votes + userVotes.length,
        hasVoted,
        timestamp: 0, // Seeds are old
      });
    });

    // Add user's merged gallery submissions
    store.submissions.forEach((sub) => {
      const challenge = galleryChallenges.find((c) => c.id === sub.challengeId);
      if (!challenge) return;
      const state = prState(sub, challenge.type, now, store.settings.demoAutoMerge);
      if (state !== 'merged') return;
      
      const payload = sub.payload as { url?: string; note?: string };
      if (!payload?.url) return;

      const userVotes = store.upvotes[sub.id] || [];
      const hasVoted = userVotes.includes(profileId);

      list.push({
        id: sub.id,
        challengeTitle: challenge.title,
        slug: challenge.slug,
        author: store.profile.name, // Or store.profile.id if we want
        note: payload.note || '',
        url: payload.url,
        votes: userVotes.length,
        hasVoted,
        timestamp: sub.openedAt,
      });
    });

    if (sortBy === 'votes') {
      list.sort((a, b) => b.votes - a.votes || b.timestamp - a.timestamp);
    } else {
      list.sort((a, b) => b.timestamp - a.timestamp || b.votes - a.votes);
    }

    return list;
  }, [galleryChallenges, store.submissions, store.upvotes, store.settings.demoAutoMerge, profileId, store.profile.name, sortBy, now]);

  if (items.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <EmptyState 
          icon={Heart} 
          message="No gallery submissions yet." 
          action={
            <Button onClick={() => window.location.href = '/'}>
              Go to Arena
            </Button>
          } 
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono text-text">Gallery</h1>
          <p className="text-muted mt-1">Design and open-build submissions from the community.</p>
        </div>
        <Button 
          variant="secondary" 
          onClick={() => setSortBy(s => s === 'votes' ? 'newest' : 'votes')}
        >
          <ArrowDownUp className="w-4 h-4 mr-2" />
          Sort by {sortBy === 'votes' ? 'Newest' : 'Votes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item.id} className="flex flex-col overflow-hidden">
            <div className="h-40 shrink-0">
              <ChallengeCover slug={item.slug} size="sm" />
            </div>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-mono text-lg font-bold text-text truncate" title={item.challengeTitle}>
                {item.challengeTitle}
              </h3>
              <p className="text-sm text-muted mt-1 mb-4">by {item.author}</p>
              
              <p className="text-sm text-text mb-6 flex-1 line-clamp-3">
                {item.note || 'No description provided.'}
              </p>

              <div className="flex items-center justify-between mt-auto">
                <Button 
                  variant="ghost" 
                  className={cn("px-2", item.hasVoted && "text-accent")}
                  onClick={() => store.toggleUpvote(item.id, profileId)}
                >
                  <Heart className={cn("w-4 h-4 mr-1", item.hasVoted && "fill-current")} />
                  <span className="font-mono">{item.votes}</span>
                </Button>
                
                <Button variant="secondary" onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
