import { useState, useEffect, useRef } from 'react';
import type { SolverProps } from './SolverRegistry';
import { Button } from '../ui/Button';
import ReactCodeMirror from '@uiw/react-codemirror';
import { html as htmlLang } from '@codemirror/lang-html';
import { css as cssLang } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';
import { Monitor, Smartphone, Check, X } from 'lucide-react';

export default function FrontendSolver({
  challenge,
  onSubmit,
  onRun,
  isPractice,
  attemptsLeft,
  draft,
  onSaveDraft,
  lastFeedback,
}: SolverProps) {
  const config = challenge.config;
  if (config.type !== 'frontend') return null;

  const defaultDraft = (draft as { html: string; css: string }) || { html: config.starterHtml, css: config.starterCss };
  const [htmlCode, setHtmlCode] = useState(defaultDraft.html);
  const [cssCode, setCssCode] = useState(defaultDraft.css);
  const [activeTab, setActiveTab] = useState<'html' | 'css'>('html');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [debouncedSrcDoc, setDebouncedSrcDoc] = useState('');

  const draftTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if ((htmlCode !== config.starterHtml || cssCode !== config.starterCss) && 
        (htmlCode !== (draft as any)?.html || cssCode !== (draft as any)?.css)) {
      if (draftTimer.current !== undefined) clearTimeout(draftTimer.current);
      draftTimer.current = window.setTimeout(() => {
        onSaveDraft({ html: htmlCode, css: cssCode });
      }, 500);
    }
    return () => {
      if (draftTimer.current !== undefined) clearTimeout(draftTimer.current);
    };
  }, [htmlCode, cssCode, config.starterHtml, config.starterCss, draft, onSaveDraft]);

  const previewTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (previewTimer.current !== undefined) clearTimeout(previewTimer.current);
    previewTimer.current = window.setTimeout(() => {
      setDebouncedSrcDoc(`<!DOCTYPE html><html><head><style>${cssCode}</style></head><body>${htmlCode}</body></html>`);
    }, 300);
    return () => {
      if (previewTimer.current !== undefined) clearTimeout(previewTimer.current);
    };
  }, [htmlCode, cssCode]);

  const handleRun = async () => {
    if (!onRun) return;
    setIsRunning(true);
    await onRun({ html: htmlCode, css: cssCode });
    setIsRunning(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit({ html: htmlCode, css: cssCode });
    setIsSubmitting(false);
  };
  
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset to starter code?')) {
      setHtmlCode(config.starterHtml);
      setCssCode(config.starterCss);
    }
  };

  const noAttempts = attemptsLeft !== null && attemptsLeft <= 0;
  const disableSubmit = isSubmitting || isRunning || (noAttempts && !isPractice);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center bg-panel border border-border p-2 rounded">
            <div className="flex gap-2">
              <Button 
                variant={activeTab === 'html' ? 'primary' : 'secondary'} 
                onClick={() => setActiveTab('html')}
                className="py-1 px-3"
              >
                HTML
              </Button>
              <Button 
                variant={activeTab === 'css' ? 'primary' : 'secondary'} 
                onClick={() => setActiveTab('css')}
                className="py-1 px-3"
              >
                CSS
              </Button>
            </div>
            <Button variant="secondary" onClick={handleReset} className="py-1 px-3 text-xs">
              Reset to starter
            </Button>
          </div>
          
          <div className="border border-border rounded overflow-hidden">
            <ReactCodeMirror
              value={activeTab === 'html' ? htmlCode : cssCode}
              height="400px"
              extensions={[activeTab === 'html' ? htmlLang() : cssLang()]}
              theme={oneDark}
              onChange={(value) => activeTab === 'html' ? setHtmlCode(value) : setCssCode(value)}
              basicSetup={{
                lineNumbers: true,
                bracketMatching: true,
                tabSize: 2,
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-end gap-2 bg-panel border border-border p-2 rounded">
             <Button 
                variant={previewMode === 'desktop' ? 'primary' : 'secondary'} 
                onClick={() => setPreviewMode('desktop')}
                className="py-1 px-3 flex gap-2 items-center"
              >
                <Monitor className="w-4 h-4" /> Desktop
              </Button>
              <Button 
                variant={previewMode === 'mobile' ? 'primary' : 'secondary'} 
                onClick={() => setPreviewMode('mobile')}
                className="py-1 px-3 flex gap-2 items-center"
              >
                <Smartphone className="w-4 h-4" /> Mobile
              </Button>
          </div>
          <div className="flex justify-center border border-border rounded overflow-hidden bg-white h-[400px] relative">
             <iframe
               sandbox="allow-same-origin"
               srcDoc={debouncedSrcDoc}
               className="h-full bg-white transition-all duration-300 shadow-md"
               style={{ width: previewMode === 'desktop' ? '100%' : '375px', border: 'none' }}
               title="preview"
             />
          </div>
        </div>
      </div>

      {lastFeedback && lastFeedback.length > 0 && (
        <div className="p-4 border border-border rounded bg-panel">
          <h3 className="font-mono text-sm mb-2 text-muted">
            Checks
          </h3>
          <ul className="space-y-1 font-mono text-sm">
            {lastFeedback.map((f, i) => {
              const passed = f.startsWith('[PASS]');
              return (
                <li key={i} className="flex items-center gap-2">
                   {passed ? <Check className="w-4 h-4 text-success shrink-0" /> : <X className="w-4 h-4 text-danger shrink-0" />}
                   <span className={passed ? 'text-success' : 'text-danger'}>{f.replace(/^\[(PASS|FAIL)\] /, '')}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="flex justify-end gap-3">
        {!isPractice && (
          <Button variant="secondary" onClick={handleRun} disabled={isRunning || isSubmitting}>
            {isRunning ? 'Checking...' : 'Run checks'}
          </Button>
        )}
        <Button onClick={handleSubmit} disabled={disableSubmit}>
          {isSubmitting ? 'Submitting...' : noAttempts && !isPractice ? 'No attempts left' : 'Submit'}
        </Button>
      </div>
    </div>
  );
}
