import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, ListTodo, Check, X, FileText
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { usePageTitle } from '../hooks';
import { 
  Button, Card, Tabs, ChallengeCard, EmptyState, Tag
} from '../components/ui';
import { cn } from '../lib/cn';
import { prState } from '../lib/selectors';
import { challenges } from '../data/challenges';
import type { 
  Challenge, Category, Difficulty, ChallengeType, 
  ChallengeConfig
} from '../types';

export default function Organizer() {
  usePageTitle('Organizer');
  const store = useStore();
  const [activeTab, setActiveTab] = useState('new');

  if (!store.organizerMode) {
    return (
      <div className="p-8 max-w-2xl mx-auto mt-12">
        <EmptyState
          icon={Lock}
          message="Organizer tools are off."
          action={
            <Button onClick={() => store.setOrganizerMode(true)}>
              Turn on Organizer mode
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 flex flex-col min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-mono text-text">Organizer Panel</h1>
          <p className="text-muted mt-1">Manage challenges and review submissions.</p>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'new', label: 'New challenge' },
          { id: 'review', label: 'Review queue' },
          { id: 'overview', label: 'Overview' },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'new' && <NewChallengeTab />}
      {activeTab === 'review' && <ReviewQueueTab />}
      {activeTab === 'overview' && <OverviewTab />}
    </div>
  );
}

function NewChallengeTab() {
  const store = useStore();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState<Category>('problem-solving');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [type, setType] = useState<ChallengeType>('code');
  const [points, setPoints] = useState(100);
  
  // Dates
  const [opensAt, setOpensAt] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [closesAt, setClosesAt] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  
  const [maxAttemptsStr, setMaxAttemptsStr] = useState('');
  const [description, setDescription] = useState('');
  const [requirementsStr, setRequirementsStr] = useState('');
  const [rulesStr, setRulesStr] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  
  // Specific config states
  const [linkKindsStr, setLinkKindsStr] = useState('github, demo');
  const [linkPrompt, setLinkPrompt] = useState('Submit your project link.');
  
  const [quizTime, setQuizTime] = useState(60);
  const [quizPass, setQuizPass] = useState(60);
  const [quizQ, setQuizQ] = useState('What is git?');
  const [quizOpts, setQuizOpts] = useState('Version control\nA car\nA food\nA language');
  const [quizAns, setQuizAns] = useState(0);
  const [quizExp, setQuizExp] = useState('It is version control.');
  
  const [regexBrief, setRegexBrief] = useState('Match a number.');
  const [regexSM, setRegexSM] = useState('123\n456');
  const [regexSR, setRegexSR] = useState('abc\ndef');
  
  const [advancedJson, setAdvancedJson] = useState('{\n  "starter": "// code here",\n  "fnName": "solve",\n  "visibleTests": [],\n  "hiddenTests": []\n}');

  // Update default points
  const handleDiffChange = (d: Difficulty) => {
    setDifficulty(d);
    setPoints(d === 'easy' ? 100 : d === 'medium' ? 150 : 300);
  };

  const handleTypeChange = (t: ChallengeType) => {
    setType(t);
    if (t === 'code') {
      setAdvancedJson('{\n  "starter": "// code here",\n  "fnName": "solve",\n  "visibleTests": [],\n  "hiddenTests": []\n}');
    } else if (t === 'frontend') {
      setAdvancedJson('{\n  "starterHtml": "<div></div>",\n  "starterCss": "",\n  "checks": []\n}');
    }
  };

  // Build the challenge object
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'new-challenge';
  
  let config: ChallengeConfig | null = null;
  let configError = '';
  try {
    if (type === 'code' || type === 'frontend') {
      const parsed = JSON.parse(advancedJson);
      if (type === 'code') {
        config = { type: 'code', starter: parsed.starter || '', fnName: parsed.fnName || 'fn', visibleTests: parsed.visibleTests || [], hiddenTests: parsed.hiddenTests || [] };
      } else {
        config = { type: 'frontend', starterHtml: parsed.starterHtml || '', starterCss: parsed.starterCss || '', checks: parsed.checks || [] };
      }
    } else if (type === 'link') {
      config = { 
        type: 'link', 
        linkKinds: linkKindsStr.split(',').map(s => s.trim().toLowerCase()) as any,
        prompt: linkPrompt
      };
    } else if (type === 'quiz') {
      config = {
        type: 'quiz',
        timeLimitSec: quizTime,
        passPercent: quizPass,
        questions: [
          { id: 'q1', prompt: quizQ, options: quizOpts.split('\n'), answerIndex: quizAns, explanation: quizExp },
          { id: 'q2', prompt: 'Dummy 2', options: ['A','B','C','D'], answerIndex: 0, explanation: 'Exp' },
          { id: 'q3', prompt: 'Dummy 3', options: ['A','B','C','D'], answerIndex: 0, explanation: 'Exp' }
        ]
      };
    } else if (type === 'regex') {
      config = {
        type: 'regex', brief: regexBrief,
        shouldMatch: regexSM.split('\n').filter(Boolean), shouldReject: regexSR.split('\n').filter(Boolean),
        hiddenMatch: [], hiddenReject: []
      };
    } else if (type === 'git-terminal') {
       configError = "Git terminal creation is not supported in the form yet.";
    }
  } catch (e) {
    configError = "Invalid JSON config";
  }

  const isValid = title && tagline && opensAt && closesAt && (new Date(closesAt) > new Date(opensAt)) && config && !configError;

  const challengePreview: Challenge | null = isValid ? {
    id: slug, slug, title, tagline, category, difficulty, type, points,
    opensAt: new Date(opensAt).toISOString(),
    closesAt: new Date(closesAt).toISOString(),
    maxAttempts: maxAttemptsStr ? parseInt(maxAttemptsStr, 10) : null,
    description: description || 'Description goes here.',
    requirements: requirementsStr.split('\n').filter(Boolean),
    rules: rulesStr.split('\n').filter(Boolean),
    tags: tagsStr.split(',').map(s => s.trim()).filter(Boolean),
    author: store.profile.name,
    config: config as ChallengeConfig,
    custom: true
  } : null;

  const handlePublish = () => {
    if (challengePreview) {
      store.addCustomChallenge(challengePreview);
      store.addActivity({
        id: crypto.randomUUID(),
        at: Date.now(),
        actor: store.profile.name,
        verb: 'created',
        challengeSlug: challengePreview.slug
      });
      // Simple toast would go here, we'll assume navigation is enough feedback
      navigate(`/challenges/${challengePreview.slug}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form */}
      <div className="space-y-6">
        <Card className="p-6 space-y-4 bg-panel">
          <h2 className="text-xl font-mono text-text">Basic info</h2>
          <div>
            <label className="block text-sm text-muted mb-1">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-panel-2 border border-border rounded-md px-3 py-2 text-text font-mono focus:border-accent outline-none transition-colors" placeholder="e.g. Center That Div" />
            <p className="text-xs text-muted mt-1">Slug: {slug}</p>
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Tagline (max 80 chars)</label>
            <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} maxLength={80} className="w-full bg-panel-2 border border-border rounded-md px-3 py-2 text-text focus:border-accent outline-none transition-colors" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-muted mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value as Category)} className="w-full bg-panel-2 border border-border rounded-md px-3 py-2 text-text focus:border-accent outline-none">
                <option value="algorithms">Algorithms</option>
                <option value="web-dev">Web Dev</option>
                <option value="git-tools">Git Tools</option>
                <option value="problem-solving">Problem Solving</option>
                <option value="design">Design</option>
                <option value="open-build">Open Build</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Difficulty</label>
              <select value={difficulty} onChange={e => handleDiffChange(e.target.value as Difficulty)} className="w-full bg-panel-2 border border-border rounded-md px-3 py-2 text-text focus:border-accent outline-none">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Type</label>
              <select value={type} onChange={e => handleTypeChange(e.target.value as ChallengeType)} className="w-full bg-panel-2 border border-border rounded-md px-3 py-2 text-text focus:border-accent outline-none">
                <option value="code">Code</option>
                <option value="frontend">Frontend</option>
                <option value="regex">Regex</option>
                <option value="quiz">Quiz</option>
                <option value="link">Link</option>
                <option value="git-terminal" disabled>Git Terminal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">XP Points</label>
              <input type="number" value={points} onChange={e => setPoints(parseInt(e.target.value) || 0)} className="w-full bg-panel-2 border border-border rounded-md px-3 py-2 text-text font-mono focus:border-accent outline-none" />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4 bg-panel">
          <h2 className="text-xl font-mono text-text">Dates & Limits</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted mb-1">Opens at</label>
              <input type="datetime-local" value={opensAt} onChange={e => setOpensAt(e.target.value)} className="w-full bg-panel-2 border border-border rounded-md px-3 py-2 text-text font-mono focus:border-accent outline-none" />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Closes at</label>
              <input type="datetime-local" value={closesAt} onChange={e => setClosesAt(e.target.value)} className="w-full bg-panel-2 border border-border rounded-md px-3 py-2 text-text font-mono focus:border-accent outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Max attempts (leave blank for unlimited)</label>
            <input type="number" value={maxAttemptsStr} onChange={e => setMaxAttemptsStr(e.target.value)} placeholder="Unlimited" className="w-full bg-panel-2 border border-border rounded-md px-3 py-2 text-text font-mono focus:border-accent outline-none" />
          </div>
        </Card>

        <Card className="p-6 space-y-4 bg-panel">
          <h2 className="text-xl font-mono text-text">Content</h2>
          <div>
            <label className="block text-sm text-muted mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full bg-panel-2 border border-border rounded-md px-3 py-2 text-text focus:border-accent outline-none resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted mb-1">Requirements (one per line)</label>
              <textarea value={requirementsStr} onChange={e => setRequirementsStr(e.target.value)} rows={3} className="w-full bg-panel-2 border border-border rounded-md px-3 py-2 text-text focus:border-accent outline-none resize-none" />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Rules (one per line)</label>
              <textarea value={rulesStr} onChange={e => setRulesStr(e.target.value)} rows={3} className="w-full bg-panel-2 border border-border rounded-md px-3 py-2 text-text focus:border-accent outline-none resize-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Tags (comma-separated)</label>
            <input type="text" value={tagsStr} onChange={e => setTagsStr(e.target.value)} placeholder="javascript, array" className="w-full bg-panel-2 border border-border rounded-md px-3 py-2 text-text font-mono focus:border-accent outline-none" />
          </div>
        </Card>

        <Card className="p-6 space-y-4 bg-panel border-accent/20">
          <h2 className="text-xl font-mono text-accent">Configuration ({type})</h2>
          
          {type === 'link' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted mb-1">Allowed link kinds</label>
                <input type="text" value={linkKindsStr} onChange={e => setLinkKindsStr(e.target.value)} className="w-full bg-panel-2 border border-border rounded-md px-3 py-2 text-text font-mono focus:border-accent outline-none" placeholder="github, figma, demo" />
              </div>
              <div>
                <label className="block text-sm text-muted mb-1">Prompt text</label>
                <input type="text" value={linkPrompt} onChange={e => setLinkPrompt(e.target.value)} className="w-full bg-panel-2 border border-border rounded-md px-3 py-2 text-text focus:border-accent outline-none" />
              </div>
            </div>
          )}

          {type === 'quiz' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted mb-1">Time limit (sec)</label>
                  <input type="number" value={quizTime} onChange={e => setQuizTime(parseInt(e.target.value)||60)} className="w-full bg-panel-2 border border-border rounded-md px-3 py-2 text-text font-mono" />
                </div>
                <div>
                  <label className="block text-sm text-muted mb-1">Pass percent</label>
                  <input type="number" value={quizPass} onChange={e => setQuizPass(parseInt(e.target.value)||60)} className="w-full bg-panel-2 border border-border rounded-md px-3 py-2 text-text font-mono" />
                </div>
              </div>
              <div className="p-4 bg-panel-2 rounded-md border border-border space-y-3">
                <p className="text-sm font-bold text-text">Question 1</p>
                <input type="text" value={quizQ} onChange={e=>setQuizQ(e.target.value)} placeholder="Prompt" className="w-full bg-panel border border-border rounded-md px-3 py-2 text-text" />
                <textarea value={quizOpts} onChange={e=>setQuizOpts(e.target.value)} rows={4} placeholder="Options (one per line)" className="w-full bg-panel border border-border rounded-md px-3 py-2 text-text" />
                <input type="number" value={quizAns} onChange={e=>setQuizAns(parseInt(e.target.value)||0)} placeholder="Answer index (0-based)" className="w-full bg-panel border border-border rounded-md px-3 py-2 text-text font-mono" />
                <input type="text" value={quizExp} onChange={e=>setQuizExp(e.target.value)} placeholder="Explanation" className="w-full bg-panel border border-border rounded-md px-3 py-2 text-text" />
              </div>
              <p className="text-xs text-muted">Note: Real app would have dynamic list, for demo we add 2 dummy questions automatically.</p>
            </div>
          )}

          {type === 'regex' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted mb-1">Brief</label>
                <input type="text" value={regexBrief} onChange={e=>setRegexBrief(e.target.value)} className="w-full bg-panel-2 border border-border rounded-md px-3 py-2 text-text" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted mb-1">Should match (lines)</label>
                  <textarea value={regexSM} onChange={e=>setRegexSM(e.target.value)} rows={4} className="w-full bg-panel-2 border border-border rounded-md px-3 py-2 text-text font-mono" />
                </div>
                <div>
                  <label className="block text-sm text-muted mb-1">Should reject (lines)</label>
                  <textarea value={regexSR} onChange={e=>setRegexSR(e.target.value)} rows={4} className="w-full bg-panel-2 border border-border rounded-md px-3 py-2 text-text font-mono" />
                </div>
              </div>
            </div>
          )}

          {(type === 'code' || type === 'frontend') && (
            <div>
              <label className="block text-sm text-muted mb-1">Advanced Config (JSON)</label>
              <textarea 
                value={advancedJson} 
                onChange={e => setAdvancedJson(e.target.value)} 
                rows={10} 
                className={cn(
                  "w-full bg-panel-2 border rounded-md px-3 py-2 text-text font-mono text-sm whitespace-pre font-normal outline-none transition-colors",
                  configError ? "border-danger focus:border-danger" : "border-border focus:border-accent"
                )}
              />
              {configError && <p className="text-danger text-sm mt-1">{configError}</p>}
            </div>
          )}
        </Card>
      </div>

      {/* Live Preview */}
      <div>
        <div className="sticky top-20 space-y-6">
          <div>
            <h3 className="text-xl font-mono text-text mb-4">Live Preview</h3>
            {challengePreview ? (
              <ChallengeCard 
                challenge={challengePreview} 
                submissions={store.submissions} 
                demoAutoMerge={store.settings.demoAutoMerge} 
              />
            ) : (
              <Card className="p-6 border-dashed bg-transparent text-center text-muted">
                Fill out required fields to see preview.
              </Card>
            )}
          </div>
          
          <Button 
            className="w-full"
            disabled={!isValid}
            onClick={handlePublish}
          >
            Publish challenge
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReviewQueueTab() {
  const store = useStore();
  
  // Find link submissions in-review
  const reviewable = store.submissions.filter((s) => {
    // Has to be link challenge
    const c = [...challenges, ...store.customChallenges].find(ch => ch.id === s.challengeId);
    if (!c || c.type !== 'link') return false;
    
    // Check if state is in-review
    const state = prState(s, 'link', Date.now(), store.settings.demoAutoMerge);
    return state === 'in-review';
  });

  if (reviewable.length === 0) {
    return (
      <Card className="p-12 text-center bg-panel">
        <ListTodo className="w-12 h-12 text-muted mx-auto mb-4" />
        <h3 className="text-lg font-mono text-text">Nothing to review.</h3>
        <p className="text-muted mt-2">Queue is clean.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviewable.map((sub) => {
        const c = [...challenges, ...store.customChallenges].find(ch => ch.id === sub.challengeId)!;
        const payload = sub.payload as { url: string; note: string };
        
        return (
          <Card key={sub.id} className="p-6 bg-panel flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <Tag label={`PR #${sub.prNumber}`} />
                <span className="font-mono font-bold text-text truncate max-w-xs">{c.title}</span>
                <span className="text-muted text-sm whitespace-nowrap">
                  {new Date(sub.openedAt).toLocaleString()}
                </span>
              </div>
              
              <div>
                <a href={payload.url} target="_blank" rel="noreferrer" className="text-accent hover:underline font-mono text-sm break-all flex items-center gap-2">
                  <FileText className="w-4 h-4 shrink-0" />
                  {payload.url}
                </a>
              </div>
              
              <div className="bg-panel-2 p-3 rounded-md text-sm text-text border border-border">
                {payload.note || <span className="text-muted italic">No note provided.</span>}
              </div>
            </div>
            
            <div className="flex sm:flex-col gap-3 shrink-0">
              <Button onClick={() => store.approveSubmission(sub.id)}>
                <Check className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button variant="danger" onClick={() => store.requestChanges(sub.id)}>
                <X className="w-4 h-4 mr-2" />
                Request changes
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function OverviewTab() {
  const store = useStore();
  const allChallenges = [...challenges, ...store.customChallenges];
  const activeCount = allChallenges.filter(c => {
    const now = Date.now();
    return now >= new Date(c.opensAt).getTime() && now <= new Date(c.closesAt).getTime();
  }).length;
  
  const mergedPRs = store.submissions.filter(s => {
    const c = allChallenges.find(ch => ch.id === s.challengeId);
    if (!c) return false;
    return prState(s, c.type, Date.now(), store.settings.demoAutoMerge) === 'merged';
  }).length;
  
  // We use seed 18 + current user = 19
  const participantsCount = 19; 

  // submissions per challenge
  const counts: Record<string, number> = {};
  store.submissions.forEach(s => {
    counts[s.challengeId] = (counts[s.challengeId] || 0) + 1;
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Challenges" value={allChallenges.length} />
        <MetricCard label="Active" value={activeCount} />
        <MetricCard label="Participants" value={participantsCount} />
        <MetricCard label="Merged PRs" value={mergedPRs + 15} /> {/* adding some fake seed merged for flavor */}
      </div>
      
      <Card className="p-6 bg-panel">
        <h3 className="text-lg font-mono text-text mb-6">Submissions per challenge</h3>
        <div className="space-y-4">
          {allChallenges.map(c => {
            const count = (counts[c.id] || 0) + (c.custom ? 0 : Math.floor(c.title.length / 2)); // fake baseline
            return (
              <div key={c.id} className="flex items-center gap-4">
                <div className="w-48 truncate font-mono text-sm text-muted">{c.title}</div>
                <div className="flex-1 bg-panel-2 h-4 rounded-full overflow-hidden border border-border">
                  <div className="h-full bg-accent" style={{ width: `${Math.min(100, Math.max(2, count * 5))}%` }} />
                </div>
                <div className="w-12 text-right font-mono text-sm text-text">{count}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="p-6 bg-panel text-center">
      <p className="text-3xl font-mono font-bold text-text mb-2">{value}</p>
      <p className="text-sm text-muted uppercase tracking-wider">{label}</p>
    </Card>
  );
}
