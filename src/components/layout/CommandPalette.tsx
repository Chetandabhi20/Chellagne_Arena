import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { usePaletteStore } from '../../store/usePaletteStore';
import { useHotkey } from '../../hooks';
import { challenges as ALL_CHALLENGES } from '../../data/challenges';
import { challengeStatus as getChallengeStatus } from '../../lib/selectors';
import { Terminal, Map, List, Settings, Link as LinkIcon, RefreshCw, X, Shield } from 'lucide-react';
import { toast } from '../ui/Toast';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { cn } from '../../lib/cn';

export const CommandPalette = () => {
  const { open, setOpen } = usePaletteStore();
  const navigate = useNavigate();
  const store = useStore();
  const [resetModalOpen, setResetModalOpen] = useState(false);

  useHotkey('k', () => setOpen(true));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, setOpen]);

  // Command.Dialog handles focus trap and overlay internally.
  // The outer component only conditionally renders the reset modal.
  // cmdk's Command.Dialog renders when open=true

  const now = Date.now();
  const allChallenges = [...ALL_CHALLENGES, ...store.customChallenges];

  const handleSelect = (callback: () => void) => {
    setOpen(false);
    callback();
  };

  return (
    <>
      <Command.Dialog 
        open={open} 
        onOpenChange={setOpen}
        label="Global Command Menu"
        className="fixed top-1/4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg bg-panel border border-border rounded-lg shadow-xl overflow-hidden flex flex-col"
        overlayClassName="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      >
        <div className="flex items-center border-b border-border px-3">
          <Terminal className="w-5 h-5 text-muted mr-2" />
          <Command.Input 
            placeholder="Type a command or search..." 
            className="flex-1 h-12 bg-transparent outline-none text-text placeholder:text-muted focus:ring-0 focus:outline-none"
          />
          <button onClick={() => setOpen(false)} className="text-muted hover:text-text p-1 focus-ring rounded" aria-label="Close menu">
            <X className="w-5 h-5" />
          </button>
        </div>

        <Command.List className="max-h-[50vh] overflow-y-auto p-2">
          <Command.Empty className="p-4 text-center text-muted text-sm">
            No matches. Try a challenge name.
          </Command.Empty>

          <Command.Group heading="Navigate" className="text-xs font-mono text-muted mb-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:mb-1">
            <Command.Item onSelect={() => handleSelect(() => navigate('/'))} className={cn("flex items-center gap-2 px-2 py-2 text-sm text-text rounded cursor-pointer data-[selected=true]:bg-panel-2 data-[selected=true]:text-accent")}>
              <Map className="w-4 h-4" /> Arena
            </Command.Item>
            <Command.Item onSelect={() => handleSelect(() => navigate('/daily'))} className={cn("flex items-center gap-2 px-2 py-2 text-sm text-text rounded cursor-pointer data-[selected=true]:bg-panel-2 data-[selected=true]:text-accent")}>
              <Map className="w-4 h-4" /> Daily
            </Command.Item>
            <Command.Item onSelect={() => handleSelect(() => navigate('/progress'))} className={cn("flex items-center gap-2 px-2 py-2 text-sm text-text rounded cursor-pointer data-[selected=true]:bg-panel-2 data-[selected=true]:text-accent")}>
              <Map className="w-4 h-4" /> Progress
            </Command.Item>
            <Command.Item onSelect={() => handleSelect(() => navigate('/leaderboard'))} className={cn("flex items-center gap-2 px-2 py-2 text-sm text-text rounded cursor-pointer data-[selected=true]:bg-panel-2 data-[selected=true]:text-accent")}>
              <Map className="w-4 h-4" /> League
            </Command.Item>
            <Command.Item onSelect={() => handleSelect(() => navigate('/gallery'))} className={cn("flex items-center gap-2 px-2 py-2 text-sm text-text rounded cursor-pointer data-[selected=true]:bg-panel-2 data-[selected=true]:text-accent")}>
              <Map className="w-4 h-4" /> Gallery
            </Command.Item>
            {store.organizerMode && (
              <Command.Item onSelect={() => handleSelect(() => navigate('/organizer'))} className={cn("flex items-center gap-2 px-2 py-2 text-sm text-text rounded cursor-pointer data-[selected=true]:bg-panel-2 data-[selected=true]:text-accent")}>
                <Shield className="w-4 h-4" /> Organizer
              </Command.Item>
            )}
          </Command.Group>

          <Command.Group heading="Challenges" className="text-xs font-mono text-muted mb-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:mb-1">
            {allChallenges.map((c) => {
              const status = getChallengeStatus(c, now);
              return (
                <Command.Item 
                  key={c.id} 
                  value={c.title + ' ' + c.type + ' ' + status}
                  onSelect={() => handleSelect(() => navigate(`/challenges/${c.slug}`))}
                  className={cn("flex flex-col px-2 py-2 rounded cursor-pointer data-[selected=true]:bg-panel-2 group")}
                >
                  <span className="text-sm text-text group-data-[selected=true]:text-accent">{c.title}</span>
                  <span className="text-xs text-muted">{c.type} · {status}</span>
                </Command.Item>
              );
            })}
          </Command.Group>

          <Command.Group heading="Actions" className="text-xs font-mono text-muted mb-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:mb-1">
            <Command.Item onSelect={() => handleSelect(() => store.setTheme(store.theme === 'dark' ? 'light' : 'dark'))} className={cn("flex items-center gap-2 px-2 py-2 text-sm text-text rounded cursor-pointer data-[selected=true]:bg-panel-2 data-[selected=true]:text-accent")}>
              <Settings className="w-4 h-4" /> Toggle theme
            </Command.Item>
            <Command.Item onSelect={() => handleSelect(() => {
              store.setOrganizerMode(!store.organizerMode);
              toast({ type: 'info', message: `Organizer mode ${!store.organizerMode ? 'on' : 'off'}` });
            })} className={cn("flex items-center gap-2 px-2 py-2 text-sm text-text rounded cursor-pointer data-[selected=true]:bg-panel-2 data-[selected=true]:text-accent")}>
              <Shield className="w-4 h-4" /> Toggle organizer mode
            </Command.Item>
            <Command.Item onSelect={() => handleSelect(() => {
              navigator.clipboard.writeText(window.location.href).then(() => {
                toast({ type: 'success', message: 'Link copied to clipboard' });
              }).catch(() => {
                toast({ type: 'error', message: 'Failed to copy link' });
              });
            })} className={cn("flex items-center gap-2 px-2 py-2 text-sm text-text rounded cursor-pointer data-[selected=true]:bg-panel-2 data-[selected=true]:text-accent")}>
              <LinkIcon className="w-4 h-4" /> Copy link to this page
            </Command.Item>
            <Command.Item onSelect={() => handleSelect(() => setResetModalOpen(true))} className={cn("flex items-center gap-2 px-2 py-2 text-sm text-text rounded cursor-pointer data-[selected=true]:bg-panel-2 data-[selected=true]:text-danger")}>
              <RefreshCw className="w-4 h-4 text-danger group-data-[selected=true]:text-danger" /> <span className="text-danger">Reset demo</span>
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Filters" className="text-xs font-mono text-muted mb-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:mb-1">
            <Command.Item onSelect={() => handleSelect(() => navigate('/?status=active'))} className={cn("flex items-center gap-2 px-2 py-2 text-sm text-text rounded cursor-pointer data-[selected=true]:bg-panel-2 data-[selected=true]:text-accent")}>
              <List className="w-4 h-4" /> Show active
            </Command.Item>
            <Command.Item onSelect={() => handleSelect(() => navigate('/?status=upcoming'))} className={cn("flex items-center gap-2 px-2 py-2 text-sm text-text rounded cursor-pointer data-[selected=true]:bg-panel-2 data-[selected=true]:text-accent")}>
              <List className="w-4 h-4" /> Show upcoming
            </Command.Item>
            <Command.Item onSelect={() => handleSelect(() => navigate('/?status=completed'))} className={cn("flex items-center gap-2 px-2 py-2 text-sm text-text rounded cursor-pointer data-[selected=true]:bg-panel-2 data-[selected=true]:text-accent")}>
              <List className="w-4 h-4" /> Show completed
            </Command.Item>
            <Command.Item onSelect={() => handleSelect(() => navigate('/?diff=easy'))} className={cn("flex items-center gap-2 px-2 py-2 text-sm text-text rounded cursor-pointer data-[selected=true]:bg-panel-2 data-[selected=true]:text-accent")}>
              <List className="w-4 h-4" /> Easy only
            </Command.Item>
            <Command.Item onSelect={() => handleSelect(() => navigate('/?diff=hard'))} className={cn("flex items-center gap-2 px-2 py-2 text-sm text-text rounded cursor-pointer data-[selected=true]:bg-panel-2 data-[selected=true]:text-accent")}>
              <List className="w-4 h-4" /> Hard only
            </Command.Item>
          </Command.Group>
        </Command.List>
        
        <div className="border-t border-border p-2 text-xs text-muted flex justify-between bg-panel">
          <span className="font-mono ml-2 hidden sm:inline">git-club / arena</span>
          <span className="text-right flex-1">Use <kbd className="font-mono bg-panel-2 px-1 rounded border border-border text-[10px]">↑</kbd> <kbd className="font-mono bg-panel-2 px-1 rounded border border-border text-[10px]">↓</kbd> to navigate, <kbd className="font-mono bg-panel-2 px-1 rounded border border-border text-[10px]">Enter</kbd> to select, <kbd className="font-mono bg-panel-2 px-1 rounded border border-border text-[10px]">Esc</kbd> to close</span>
        </div>
      </Command.Dialog>

      <Modal isOpen={resetModalOpen} onClose={() => setResetModalOpen(false)} title="Reset Demo?">
        <p className="text-text mb-6">This will clear all your progress and restore the initial seed state. This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setResetModalOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={() => {
            store.resetDemo();
            setResetModalOpen(false);
            toast({ type: 'success', message: 'Demo reset to initial state' });
            navigate('/');
          }}>Reset Demo</Button>
        </div>
      </Modal>
    </>
  );
};
