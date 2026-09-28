export interface RegexTestCase {
  str: string;
  shouldMatch: boolean;
}

export interface RegexRunnerResult {
  results: { str: string; ok: boolean; matched: boolean }[];
  error?: string;
}

const workerCode = `
self.onmessage = async (e) => {
  const { pattern, flags, tests } = e.data;
  try {
    const regex = new RegExp(pattern, flags);
    const results = [];
    for (const test of tests) {
      const matched = regex.test(test.str);
      results.push({ str: test.str, ok: matched === test.shouldMatch, matched });
    }
    self.postMessage({ results });
  } catch (err) {
    self.postMessage({ error: err instanceof Error ? err.message : String(err) });
  }
};
`;

export function runRegexInWorker(pattern: string, flags: string, tests: RegexTestCase[]): Promise<RegexRunnerResult> {
  return new Promise((resolve) => {
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);

    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        worker.terminate();
        URL.revokeObjectURL(url);
        resolve({ results: [], error: 'Time limit exceeded (2s). Possible catastrophic backtracking.' });
      }
    }, 2000);

    worker.onmessage = (e) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        worker.terminate();
        URL.revokeObjectURL(url);
        resolve(e.data);
      }
    };

    worker.onerror = (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        worker.terminate();
        URL.revokeObjectURL(url);
        resolve({ results: [], error: err.message || 'Unknown worker error' });
      }
    };

    worker.postMessage({ pattern, flags, tests });
  });
}
