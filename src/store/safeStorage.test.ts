import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { safeStorage } from './safeStorage';

describe('safeStorage', () => {
  let localStorageMock: any;

  beforeEach(() => {
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    (global as any).window = { localStorage: localStorageMock };
  });

  afterEach(() => {
    delete (global as any).window;
  });

  it('uses localStorage when available', () => {
    localStorageMock.getItem.mockReturnValue('test-value');

    safeStorage.setItem('key1', 'test-value');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('key1', 'test-value');

    const val = safeStorage.getItem('key1');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('key1');
    expect(val).toBe('test-value');
  });

  it('falls back to in-memory Map when localStorage throws', () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('SecurityError');
    });

    safeStorage.setItem('key2', 'fallback-value');
    const val = safeStorage.getItem('key2');
    
    expect(val).toBe('fallback-value');
  });
});
