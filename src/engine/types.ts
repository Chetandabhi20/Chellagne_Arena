export interface CheckOutput {
  passed: boolean;
  scoreFraction: number;
  feedback: string[];
  details?: unknown;
}

export interface Engine<P> {
  /** Run visible checks only — no attempt consumed */
  run(challenge: import('../types').Challenge, payload: P): Promise<CheckOutput>;
  /** Run all checks including hidden — consumes an attempt */
  submit(challenge: import('../types').Challenge, payload: P): Promise<CheckOutput>;
}
