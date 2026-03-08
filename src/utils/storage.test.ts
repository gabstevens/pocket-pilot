import { describe, it, expect, vi, beforeEach } from 'vitest';
import { safeParse } from './storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should return fallback if item does not exist', () => {
    expect(safeParse('missing', 'fallback')).toBe('fallback');
  });

  it('should parse and return item if exists', () => {
    localStorage.setItem('exists', JSON.stringify({ key: 'value' }));
    expect(safeParse('exists', {})).toEqual({ key: 'value' });
  });

  it('should return fallback and log error on parse failure', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem('bad', 'invalid json');
    expect(safeParse('bad', 'fallback')).toBe('fallback');
    expect(consoleError).toHaveBeenCalled();
  });
});
