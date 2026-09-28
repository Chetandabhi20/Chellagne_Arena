import type { Challenge } from '../types';
import type { Engine, CheckOutput } from './types';

export interface LinkPayload {
  url: string;
  note: string;
}

function validateUrl(url: string, linkKinds: string[]): string[] {
  const errors: string[] = [];

  if (!url.startsWith('https://')) {
    errors.push('URL must start with https://');
    return errors;
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    // If linkKinds includes 'other' or 'demo', any https URL is fine
    if (linkKinds.includes('other') || linkKinds.includes('demo')) {
      return errors;
    }

    const hostChecks: Record<string, string> = {
      github: 'github.com',
      figma: 'figma.com',
      drive: 'drive.google.com',
    };

    const allowed = linkKinds
      .filter((k) => k in hostChecks)
      .map((k) => hostChecks[k]);

    if (allowed.length > 0 && !allowed.some((h) => host.includes(h))) {
      errors.push(`URL must be from: ${allowed.join(', ')}`);
    }
  } catch {
    errors.push('Invalid URL format');
  }

  return errors;
}

export const linkEngine: Engine<LinkPayload> = {
  async run(challenge: Challenge, payload: LinkPayload): Promise<CheckOutput> {
    const config = challenge.config;
    if (config.type !== 'link') {
      return { passed: false, scoreFraction: 0, feedback: ['Invalid challenge type.'] };
    }

    const errors = validateUrl(payload.url, config.linkKinds);
    if (errors.length > 0) {
      return { passed: false, scoreFraction: 0, feedback: errors };
    }

    return { passed: true, scoreFraction: 1, feedback: ['URL looks good.'] };
  },

  async submit(challenge: Challenge, payload: LinkPayload): Promise<CheckOutput> {
    const config = challenge.config;
    if (config.type !== 'link') {
      return { passed: false, scoreFraction: 0, feedback: ['Invalid challenge type.'] };
    }

    const errors = validateUrl(payload.url, config.linkKinds);
    if (errors.length > 0) {
      return { passed: false, scoreFraction: 0, feedback: errors };
    }

    if (!payload.note.trim()) {
      return { passed: false, scoreFraction: 0, feedback: ['Please add a note about your submission.'] };
    }

    return { passed: true, scoreFraction: 1, feedback: ['Link submitted for review.'] };
  },
};
