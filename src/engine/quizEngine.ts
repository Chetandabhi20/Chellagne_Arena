import type { Challenge } from '../types';
import type { Engine, CheckOutput } from './types';

export const quizEngine: Engine<number[]> = {
  async run(_challenge: Challenge, _answers: number[]): Promise<CheckOutput> {
    // Quiz doesn't have a separate "run" concept — just return empty pass
    // The UI handles per-question feedback directly
    return { passed: false, scoreFraction: 0, feedback: ['Use Submit to check your answers.'] };
  },

  async submit(challenge: Challenge, answers: number[]): Promise<CheckOutput> {
    const config = challenge.config;
    if (config.type !== 'quiz') {
      return { passed: false, scoreFraction: 0, feedback: ['Invalid challenge type.'] };
    }

    const { questions, passPercent } = config;
    let correct = 0;
    const feedback: string[] = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const userAnswer = answers[i];
      if (userAnswer === q.answerIndex) {
        correct++;
        feedback.push(`Q${i + 1}: Correct`);
      } else {
        feedback.push(`Q${i + 1}: Wrong — ${q.explanation}`);
      }
    }

    const total = questions.length;
    const scoreFraction = total === 0 ? 0 : correct / total;
    const passed = (scoreFraction * 100) >= passPercent;

    feedback.unshift(`Score: ${correct} of ${total} (${Math.round(scoreFraction * 100)}%)`);
    if (!passed) {
      feedback.push(`You need at least ${passPercent}% to pass.`);
    }

    return { passed, scoreFraction: passed ? scoreFraction : 0, feedback };
  },
};
