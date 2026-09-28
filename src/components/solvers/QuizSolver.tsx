import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Challenge } from '../../types';
import { Button } from '../ui';
import { cn } from '../../lib/cn';
import { ProgressBar } from '../ui';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../../hooks';
import { djb2 } from '../../lib/hash';

interface QuizSolverProps {
  challenge: Challenge;
  onSubmit: (answers: number[]) => Promise<void>;
  isPractice: boolean;
  attemptsLeft: number | null;
  lastFeedback?: string[] | null;
}

/** Seeded shuffle using a deterministic PRNG */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed >>> 0;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s + 0x6d2b79f5) >>> 0;
    let r = s;
    r = Math.imul(r ^ (r >>> 15), r | 1) >>> 0;
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    const rand = ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    const j = Math.floor(rand * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function QuizSolver({
  challenge,
  onSubmit,
  isPractice,
  attemptsLeft,
  lastFeedback,
}: QuizSolverProps) {
  const reduced = useReducedMotion();
  const config = challenge.config;
  if (config.type !== 'quiz') return null;

  const { timeLimitSec, questions: rawQuestions } = config;

  // Shuffle questions seeded by attempt number (stable per attempt)
  const attemptSeed = useMemo(() => {
    const used = challenge.maxAttempts !== null && attemptsLeft !== null
      ? challenge.maxAttempts - attemptsLeft
      : 0;
    return djb2(`${challenge.id}-attempt-${used}`);
  }, [challenge.id, challenge.maxAttempts, attemptsLeft]);

  const questions = useMemo(
    () => seededShuffle(rawQuestions, attemptSeed),
    [rawQuestions, attemptSeed]
  );

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => new Array(questions.length).fill(null)
  );
  const [timeLeft, setTimeLeft] = useState(timeLimitSec);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Timer
  useEffect(() => {
    if (submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-submit at 0
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [submitted]);

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (timeLeft === 0 && !submitted) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, submitted]);

  // Announce timer warnings
  useEffect(() => {
    if (timeLeft === 30 || timeLeft === 10) {
      // aria-live region will pick this up
    }
  }, [timeLeft]);

  const selectOption = useCallback((qIdx: number, optIdx: number) => {
    if (submitted) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[qIdx] = optIdx;
      return next;
    });
  }, [submitted]);

  const handleSubmit = useCallback(async () => {
    if (submitted || submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);

    // Convert null answers to -1 (unanswered)
    const finalAnswers = answers.map((a) => a ?? -1);
    await onSubmit(finalAnswers);
    setSubmitted(true);
    setSubmitting(false);
  }, [answers, submitted, submitting, onSubmit]);

  const goNext = () => {
    if (currentQ < questions.length - 1) setCurrentQ((p) => p + 1);
  };
  const goPrev = () => {
    if (currentQ > 0) setCurrentQ((p) => p - 1);
  };

  // Keyboard shortcuts: 1-4 for options, Enter for next/submit
  useEffect(() => {
    if (submitted) return;
    const handler = (e: KeyboardEvent) => {
      const num = parseInt(e.key);
      if (num >= 1 && num <= 4) {
        selectOption(currentQ, num - 1);
      }
      if (e.key === 'Enter') {
        if (currentQ < questions.length - 1) {
          goNext();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentQ, questions.length, submitted, selectOption]);

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const answeredCount = answers.filter((a) => a !== null).length;
  const q = questions[currentQ];

  // After submit, show review
  if (submitted && lastFeedback) {
    return (
      <div className="border border-border rounded bg-panel p-4">
        <h3 className="font-mono font-bold text-lg mb-4">Results</h3>
        <p className="text-sm font-mono text-text mb-4">{lastFeedback[0]}</p>
        <div className="space-y-3">
          {questions.map((question, i) => {
            const userAnswer = answers[i] ?? -1;
            const isCorrect = userAnswer === question.answerIndex;
            return (
              <div key={question.id} className="border border-border rounded p-3">
                <div className="flex items-start gap-2 mb-2">
                  {isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                  )}
                  <span className="text-sm">{question.prompt}</span>
                </div>
                <div className="ml-6 text-xs text-muted">
                  {!isCorrect && (
                    <p className="mb-1">
                      Your answer: <span className="text-danger">{userAnswer >= 0 ? question.options[userAnswer] : 'No answer'}</span>
                    </p>
                  )}
                  <p>
                    Correct: <span className="text-success">{question.options[question.answerIndex]}</span>
                  </p>
                  <p className="mt-1 text-muted italic">{question.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>

        {isPractice && (
          <p className="text-xs text-muted font-mono mt-4 text-center">
            Practice run — no XP or PR awarded.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="border border-border rounded bg-panel p-4">
      {/* Header: progress + timer */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-sm text-muted">
          Q{currentQ + 1} / {questions.length}
        </span>
        <span
          className={cn(
            'font-mono text-sm',
            timeLeft <= 30 ? 'text-danger font-bold' : 'text-warning'
          )}
          role="timer"
          aria-live="polite"
          aria-label={`${formatTimer(timeLeft)} remaining`}
        >
          <Clock className="w-4 h-4 inline mr-1" />
          {formatTimer(timeLeft)}
        </span>
      </div>

      <ProgressBar
        progress={(answeredCount / questions.length) * 100}
        className="mb-4"
      />

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={reduced ? false : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduced ? undefined : { opacity: 0, x: -20 }}
          transition={{ duration: 0.15 }}
        >
          <h3 className="text-base font-medium mb-4">{q.prompt}</h3>

          <div className="space-y-2" role="radiogroup" aria-label={`Question ${currentQ + 1}`}>
            {q.options.map((opt, optIdx) => {
              const selected = answers[currentQ] === optIdx;
              return (
                <button
                  key={optIdx}
                  role="radio"
                  aria-checked={selected}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded border transition-colors text-sm',
                    'hover:bg-panel-2 focus-ring',
                    selected
                      ? 'border-accent bg-accent/10 text-text'
                      : 'border-border bg-panel text-text'
                  )}
                  onClick={() => selectOption(currentQ, optIdx)}
                >
                  <span className="font-mono text-muted mr-2">{optIdx + 1}.</span>
                  {opt}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4 gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={goPrev}
          disabled={currentQ === 0}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {currentQ < questions.length - 1 ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={goNext}
              disabled={answers[currentQ] === null}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={submitting || (attemptsLeft !== null && attemptsLeft <= 0)}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          )}
        </div>
      </div>

      {attemptsLeft !== null && attemptsLeft <= 0 && (
        <p className="text-xs text-danger font-mono mt-3 text-center">
          No attempts left
        </p>
      )}

      {/* Keyboard hints */}
      <p className="text-xs text-muted mt-3 text-center">
        Press 1–4 to select, Enter to advance
      </p>
    </div>
  );
}
