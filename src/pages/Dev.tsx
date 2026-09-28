import { useState } from 'react';
import { Button, Tag, StatusPill, DifficultyDot, Card, Tabs, Modal, Skeleton, EmptyState, ProgressBar, CountUp, Countdown, Kbd, CommitLine, ChallengeCover, toast } from '../components/ui';
import { Search } from 'lucide-react';
import { usePageTitle } from '../hooks';

export default function Dev() {
  usePageTitle('Dev UI');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  return (
    <div className="space-y-12 pb-24">
      <h1 className="text-3xl font-mono font-bold">UI Primitives</h1>
      
      <section className="space-y-4">
        <h2 className="text-xl font-mono">Buttons</h2>
        <div className="flex gap-4 items-center">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-mono">Indicators</h2>
        <div className="flex gap-4 items-center">
          <Tag>frontend</Tag>
          <StatusPill status="upcoming" />
          <StatusPill status="active" />
          <StatusPill status="completed" />
          <StatusPill status="open" />
          <StatusPill status="in-review" />
          <StatusPill status="merged" />
        </div>
        <div className="flex gap-4 items-center">
          <DifficultyDot diff="easy" />
          <DifficultyDot diff="medium" />
          <DifficultyDot diff="hard" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-mono">Card &amp; Cover</h2>
        <Card className="w-80">
          <ChallengeCover slug="test-challenge" />
          <div className="p-4">
            <h3 className="font-mono font-bold mb-1">Test Challenge</h3>
            <p className="text-sm text-muted">This is a test description.</p>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-mono">Tabs</h2>
        <Tabs tabs={[{id:'1', label:'Active (3)'}, {id:'2', label:'Completed (1)'}]} active={activeTab} onChange={setActiveTab} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-mono">Modal &amp; Toasts</h2>
        <div className="flex gap-4">
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          <Button onClick={() => toast({ type: 'success', message: 'Task completed successfully!' })}>Success Toast</Button>
          <Button onClick={() => toast({ type: 'error', message: 'Failed to save.' })}>Error Toast</Button>
          <Button onClick={() => toast({ type: 'info', message: 'Did you know?' })}>Info Toast</Button>
        </div>
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Test Modal">
          <p className="mb-4 text-muted">This is a focus-trapped modal.</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setModalOpen(false)}>Confirm</Button>
          </div>
        </Modal>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-mono">Loaders &amp; States</h2>
        <Skeleton className="w-full h-24" />
        <EmptyState icon={Search} message="No results found." action={<Button variant="secondary">Clear</Button>} />
        <div className="max-w-md">
          <ProgressBar progress={65} />
          <p className="text-xs text-muted mt-2 font-mono">65% to next level</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-mono">Values</h2>
        <div className="font-mono">
          XP: <CountUp value={1200} /> <br/>
          Deadline: <Countdown to={Date.now() + 100000000} />
        </div>
        <p>Press <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> to search.</p>
        <CommitLine entry={{ id: 'a3f9c21', actor: 'Rutvi', verb: 'merged', challengeSlug: 'regex-roll-number', at: Date.now(), xp: 150 }} />
      </section>
    </div>
  );
}
