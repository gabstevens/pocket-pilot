import { describe, it, expect, vi, afterEach } from 'vitest';
import { generateUUID } from './uuid';

describe('uuid', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should generate UUID using crypto if available', () => {
    const uuid = generateUUID();
    expect(uuid).toBeDefined();
    expect(uuid.length).toBe(36);
  });

  it('should generate fallback UUID if crypto is missing', () => {
    // Mock crypto.randomUUID to be undefined
    const originalCrypto = global.crypto;
    Object.defineProperty(global, 'crypto', {
      value: { ...originalCrypto, randomUUID: undefined },
      writable: true,
      configurable: true
    });
    
    const uuid = generateUUID();
    expect(uuid).toBeDefined();
    expect(uuid.length).toBe(36);
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    
    // Restore
    Object.defineProperty(global, 'crypto', {
      value: originalCrypto,
      writable: true,
      configurable: true
    });
  });
});
