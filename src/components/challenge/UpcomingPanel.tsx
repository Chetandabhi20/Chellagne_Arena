import { Countdown } from '../ui/Countdown';
import { Button } from '../ui';
import { useStore } from '../../store/useStore';
import { toast } from '../ui/Toast';
import { Bell, BellOff } from 'lucide-react';

interface UpcomingPanelProps {
  challengeId: string;
  opensAt: number;
}

/**
 * Shown for upcoming challenges: countdown to unlock,
 * a "Notify me" toggle, and a message.
 */
export function UpcomingPanel({ challengeId, opensAt }: UpcomingPanelProps) {
  const notify = useStore((s) => s.notify[challengeId]);
  const toggleNotify = useStore((s) => s.toggleNotify);

  const handleToggle = () => {
    toggleNotify(challengeId);
    if (!notify) {
      toast({ type: 'info', message: "We'll remind you when this challenge unlocks." });
    }
  };

  return (
    <div className="border border-border rounded bg-panel p-6 text-center">
      <div className="mb-4">
        <Countdown to={opensAt} prefix="Unlocks in" />
      </div>
      <p className="text-sm text-muted mb-4">
        This challenge hasn't opened yet. You can read the description while you wait.
      </p>
      <Button
        variant={notify ? 'secondary' : 'primary'}
        size="sm"
        onClick={handleToggle}
        aria-pressed={notify || false}
        className="gap-2"
      >
        {notify ? (
          <>
            <BellOff className="w-4 h-4" />
            Notifications on
          </>
        ) : (
          <>
            <Bell className="w-4 h-4" />
            Notify me
          </>
        )}
      </Button>
    </div>
  );
}
