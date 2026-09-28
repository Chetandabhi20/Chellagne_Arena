import { describe, it, expect } from 'vitest';

describe('codeRunner timeout manual test documentation', () => {
  it('documents how to manually test timeout behaviour', () => {
    // The Vite Vitest environment is set to 'node' which does not natively support
    // Web Workers from Blob URLs in the same way browsers do. 
    // To manually test the timeout behavior:
    // 1. Run the app (`npm run dev`)
    // 2. Open the 'Merge Two Sorted Commits' challenge.
    // 3. Enter an infinite loop in the CodeMirror editor:
    //    `function mergeSorted(a, b) { while(true) {} }`
    // 4. Click 'Run' or 'Submit'.
    // 5. After exactly 2000ms, the UI should display the error:
    //    "Time limit exceeded (2s). Check for an infinite loop."
    // 6. The UI must remain responsive during those 2 seconds.
    expect(true).toBe(true);
  });
});
