import { deepEqual } from '../lib/deepEqual';

export interface TestCaseResult {
  ok: boolean;
  actual?: unknown;
  error?: string;
  ms: number;
}

export interface RunnerResult {
  results: TestCaseResult[];
  logs: string[];
  error?: string; // for top-level errors like syntax errors or timeout
}

export interface RunnerPayload {
  code: string;
  fnName: string;
  tests: { args: unknown[]; expected: unknown }[];
}

const workerCode = `
importScripts("data:application/javascript,${encodeURIComponent(
  `self.deepEqual = ${deepEqual.toString()}`
)}");

self.onmessage = async (e) => {
  const { code, fnName, tests } = e.data;
  const logs = [];
  
  const originalConsoleLog = console.log;
  console.log = (...args) => {
    if (logs.length < 50) {
      const msg = args.map(a => 
        typeof a === 'object' ? JSON.stringify(a) : String(a)
      ).join(' ');
      logs.push(msg.length > 200 ? msg.substring(0, 200) + '...' : msg);
    }
  };

  try {
    const fn = new Function(code + '\\nreturn ' + fnName + ';')();
    if (typeof fn !== 'function') {
      throw new Error("Function '" + fnName + "' not found.");
    }

    const results = [];
    for (const test of tests) {
      const start = performance.now();
      try {
        const clonedArgs = structuredClone(test.args);
        const actual = fn(...clonedArgs);
        const ok = self.deepEqual(actual, test.expected);
        results.push({ ok, actual, ms: performance.now() - start });
      } catch (err) {
        results.push({ ok: false, error: err instanceof Error ? err.message : String(err), ms: performance.now() - start });
      }
    }
    self.postMessage({ results, logs });
  } catch (err) {
    let errorMsg = err instanceof Error ? err.message : String(err);
    if (err instanceof SyntaxError && err.stack) {
      const lines = err.stack.split('\\n');
      if (lines[0]) errorMsg = lines[0];
    }
    self.postMessage({ error: errorMsg, logs });
  } finally {
    console.log = originalConsoleLog;
  }
};
`;

export function runCodeInWorker(payload: RunnerPayload): Promise<RunnerResult> {
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
        resolve({
          results: [],
          logs: [],
          error: "Time limit exceeded (2s). Check for an infinite loop.",
        });
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
        resolve({
          results: [],
          logs: [],
          error: err.message || "Unknown worker error",
        });
      }
    };

    worker.postMessage(payload);
  });
}
