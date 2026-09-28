import type { Challenge, ChallengeConfig, FrontendCheck } from '../types';
import type { Engine, CheckOutput } from './types';

export interface FrontendPayload {
  html: string;
  css: string;
}

function getSrcDoc(html: string, css: string) {
  return `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}</body></html>`;
}

async function runChecks(html: string, css: string, checks: FrontendCheck[]): Promise<{ passed: boolean; feedback: string[] }> {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.top = '-9999px';
  iframe.style.left = '-9999px';
  iframe.style.height = '800px';
  iframe.style.border = 'none';
  // Allow scripts to run? Spec: "(no scripts execute; HTML/CSS only)".
  // allow-same-origin is specified. We shouldn't allow scripts.
  iframe.sandbox.add('allow-same-origin');
  iframe.srcdoc = getSrcDoc(html, css);
  
  document.body.appendChild(iframe);
  
  await new Promise(r => {
    iframe.onload = r;
  });

  const feedback: string[] = [];
  let allPassed = true;

  const waitFrames = () => new Promise(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });

  const doc = iframe.contentDocument;
  if (!doc) {
    document.body.removeChild(iframe);
    return { passed: false, feedback: ['Failed to load iframe document'] };
  }

  for (const check of checks) {
    const width = check.viewport ?? 800;
    iframe.style.width = `${width}px`;
    await waitFrames();

    let passed = false;
    const elements = Array.from(doc.querySelectorAll(check.selector));
    const el = elements[0] as HTMLElement | undefined;

    try {
      switch (check.kind) {
        case 'exists':
          passed = elements.length >= (check.min ?? 1);
          break;
        case 'style':
          if (el) {
            const style = iframe.contentWindow!.getComputedStyle(el);
            const val = style.getPropertyValue(check.prop) || (style as any)[check.prop];
            passed = new RegExp(check.matches).test(val);
          }
          break;
        case 'centered':
          if (el) {
            const withinEls = doc.querySelectorAll(check.within);
            const withinEl = withinEls[0] as HTMLElement | undefined;
            if (withinEl) {
              const rect1 = el.getBoundingClientRect();
              const rect2 = withinEl.getBoundingClientRect();
              const c1x = rect1.left + rect1.width / 2;
              const c1y = rect1.top + rect1.height / 2;
              const c2x = rect2.left + rect2.width / 2;
              const c2y = rect2.top + rect2.height / 2;
              
              if (check.axis === 'x') passed = Math.abs(c1x - c2x) <= 2;
              else if (check.axis === 'y') passed = Math.abs(c1y - c2y) <= 2;
              else passed = Math.abs(c1x - c2x) <= 2 && Math.abs(c1y - c2y) <= 2;
            }
          }
          break;
        case 'sameRow':
          if (elements.length >= check.min) {
            const tops = elements.map(e => e.getBoundingClientRect().top);
            const valid = tops.every(t => Math.abs(t - tops[0]) <= 2);
            passed = valid;
          }
          break;
        case 'stacked':
          if (elements.length >= check.min) {
            const tops = elements.map(e => e.getBoundingClientRect().top);
            let valid = true;
            for (let i = 0; i < tops.length; i++) {
              for (let j = i + 1; j < tops.length; j++) {
                if (Math.abs(tops[i] - tops[j]) <= 8) {
                  valid = false;
                  break;
                }
              }
            }
            passed = valid;
          }
          break;
        case 'textIncludes':
          if (el) {
            passed = (el.textContent || '').toLowerCase().includes(check.text.toLowerCase());
          }
          break;
      }
    } catch (e) {
      passed = false;
    }

    if (passed) {
      feedback.push(`[PASS] ${check.label}`);
    } else {
      feedback.push(`[FAIL] ${check.label}`);
      allPassed = false;
    }
  }

  document.body.removeChild(iframe);
  return { passed: allPassed, feedback };
}

export const frontendEngine: Engine<FrontendPayload> = {
  async run(challenge: Challenge, payload: FrontendPayload): Promise<CheckOutput> {
    const config = challenge.config as ChallengeConfig & { type: 'frontend' };
    const { passed, feedback } = await runChecks(payload.html, payload.css, config.checks);
    return {
      passed,
      scoreFraction: passed ? 1 : 0,
      feedback
    };
  },
  
  async submit(challenge: Challenge, payload: FrontendPayload): Promise<CheckOutput> {
    return this.run(challenge, payload);
  }
};
