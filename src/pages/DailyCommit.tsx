import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { dailyPick } from '../lib/selectors';
import { dailyPool } from '../data/dailyPool';
import { dateKey } from '../lib/time';
import { toast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/cn';
import { streak as calculateStreak, activeDays } from '../lib/xp';
import { challenges } from '../data/challenges';
import { SEED_HEATMAP_OFFSETS } from '../data';

export default function DailyCommit() {
  const store = useStore();
  const pick = useMemo(() => dailyPick(dailyPool), []);
  const todayKey = dateKey(Date.now());
  const existingResult = store.dailyResults.find(r => r.dateKey === todayKey);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  
  // Instant feedback state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQ = pick.questions[currentIndex];
  
  const handleOptionSelect = (index: number) => {
    if (showExplanation) return;
    setSelectedOption(index);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (selectedOption === null) return;
    const newAnswers = [...answers, selectedOption];
    
    if (currentIndex === pick.questions.length - 1) {
      // Finished
      const correctCount = newAnswers.filter((a, i) => a === pick.questions[i].answerIndex).length;
      store.addDailyResult({
        dateKey: todayKey,
        answers: newAnswers,
        correct: correctCount,
        total: pick.questions.length,
      });
      store.addActivity({
        id: `act-daily-${todayKey}`,
        at: Date.now(),
        actor: store.profile.name,
        verb: 'opened',
        challengeSlug: 'daily-commit', // Use a pseudo-slug for daily
        xp: 20 + (correctCount === pick.questions.length ? 10 : 0)
      });
      toast({ type: 'success', message: `Daily Commit #${pick.puzzleNumber} completed!` });
    } else {
      setAnswers(newAnswers);
      setSelectedOption(null);
      setShowExplanation(false);
      setCurrentIndex(prev => prev + 1);
    }
  };
  
  const generateShareText = (result: import('../types').DailyResult, currentStreak: number) => {
    let squares = '';
    for (let i = 0; i < result.answers.length; i++) {
      squares += result.answers[i] === pick.questions[i].answerIndex ? '🟩' : '🟥';
    }
    return `Git Club Daily Commit #${pick.puzzleNumber} ${result.correct}/${result.total}\n${squares}\nstreak ${currentStreak} ⚡ arena`;
  };

  const handleCopy = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => toast({ type: 'success', message: 'Copied to clipboard' }))
        .catch(() => toast({ type: 'error', message: 'Failed to copy' }));
    } else {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast({ type: 'success', message: 'Copied to clipboard' });
      } catch (err) {
        toast({ type: 'error', message: 'Failed to copy' });
      }
      document.body.removeChild(textArea);
    }
  };

  if (existingResult) {
    const activeDaySet = activeDays(store.submissions, store.customChallenges.length ? [...challenges, ...store.customChallenges] : challenges, store.dailyResults, SEED_HEATMAP_OFFSETS, Date.now(), store.settings.demoAutoMerge);
    const currentStreak = calculateStreak(activeDaySet, Date.now());
    const shareText = generateShareText(existingResult, currentStreak);
    
    return (
      <div className="max-w-2xl mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh] gap-8">
        <h1 className="text-2xl font-bold font-mono">Git Club Daily Commit #{pick.puzzleNumber}</h1>
        
        <div className="bg-panel border border-border p-6 rounded-lg text-center flex flex-col items-center gap-4 min-w-[300px]">
          <div className="text-4xl font-mono mb-2">
            {existingResult.correct} / {existingResult.total}
          </div>
          
          <div className="flex gap-2 mb-2">
            {existingResult.answers.map((ans, i) => {
               const isCorrect = ans === pick.questions[i].answerIndex;
               return (
                 <div 
                   key={i} 
                   className={cn(
                     "w-8 h-8 rounded border-2 flex items-center justify-center",
                     isCorrect ? "bg-success/20 border-success text-success" : "border-danger text-danger bg-transparent"
                   )}
                 />
               );
            })}
          </div>
          
          <div className="font-mono text-muted text-sm mb-4">
            streak {currentStreak} ⚡ arena
          </div>
          
          <Button onClick={() => handleCopy(shareText)} className="w-full">
            Copy result
          </Button>
          
          {/* Fallback readonly textarea (visually hidden but accessible for manual copy if needed, or we just rely on the fallback logic) */}
          <textarea 
             readOnly 
             value={shareText}
             className="sr-only" 
             aria-hidden="true"
             tabIndex={-1}
          />
        </div>
        
        <p className="text-muted text-sm">Come back tomorrow for the next challenge.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-6">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono">Daily Commit #{pick.puzzleNumber}</h1>
          <p className="text-sm text-muted">Complete to maintain your streak and earn 20 XP.</p>
        </div>
        <div className="font-mono text-sm bg-panel px-3 py-1 rounded border border-border">
          Q{currentIndex + 1} / {pick.questions.length}
        </div>
      </div>

      <div className="flex flex-col gap-6 mt-4">
        <h2 className="text-lg font-medium">{currentQ.prompt}</h2>

        <div className="flex flex-col gap-3" role="radiogroup">
          {currentQ.options.map((opt, i) => {
             let stateClass = "border-border hover:border-text/50 bg-panel";
             if (showExplanation) {
               if (i === currentQ.answerIndex) {
                 stateClass = "border-success bg-success/10 text-success";
               } else if (i === selectedOption) {
                 stateClass = "border-danger bg-danger/10 text-danger";
               } else {
                 stateClass = "border-border opacity-50 bg-panel";
               }
             } else if (selectedOption === i) {
               stateClass = "border-primary bg-primary/10";
             }
             
             return (
               <button
                 key={i}
                 role="radio"
                 aria-checked={selectedOption === i}
                 disabled={showExplanation}
                 onClick={() => handleOptionSelect(i)}
                 className={cn(
                   "p-4 rounded-lg border text-left transition-colors flex items-center gap-3",
                   stateClass
                 )}
               >
                 <div className={cn(
                   "w-5 h-5 rounded-full border flex items-center justify-center shrink-0",
                   showExplanation && i === currentQ.answerIndex ? "border-success bg-success" :
                   showExplanation && i === selectedOption ? "border-danger bg-danger" :
                   selectedOption === i ? "border-primary bg-primary" : "border-muted"
                 )}>
                   {(showExplanation && i === currentQ.answerIndex) && <div className="w-2 h-2 rounded-full bg-white" />}
                   {(selectedOption === i && !showExplanation) && <div className="w-2 h-2 rounded-full bg-white" />}
                 </div>
                 {opt}
               </button>
             );
          })}
        </div>
        
        {showExplanation && (
          <div className={cn(
            "p-4 rounded-lg border",
            selectedOption === currentQ.answerIndex ? "bg-success/10 border-success" : "bg-danger/10 border-danger"
          )}>
            <div className="font-bold mb-2">
              {selectedOption === currentQ.answerIndex ? 'Correct!' : 'Incorrect.'}
            </div>
            <p className="text-sm">{currentQ.explanation}</p>
          </div>
        )}

        <div className="flex justify-end mt-4">
           <Button onClick={handleNext} disabled={selectedOption === null}>
             {currentIndex === pick.questions.length - 1 ? 'Finish' : 'Next'}
           </Button>
        </div>
      </div>
    </div>
  );
}
