import { describe, it, expect } from 'vitest';
import { generateSessionCode, isValidSessionCode } from './sessionCode';

describe('generateSessionCode', () => {
  it('generates a 6-character uppercase code', () => {
    const code = generateSessionCode();
    expect(code).toHaveLength(6);
    expect(code).toBe(code.toUpperCase());
  });

  it('never contains ambiguous characters 0, O, 1, I', () => {
    for (let i = 0; i < 200; i++) {
      const code = generateSessionCode();
      expect(code).not.toMatch(/[01OI]/);
    }
  });

  it('generates different codes across calls (extremely unlikely collision)', () => {
    const codes = new Set();
    for (let i = 0; i < 50; i++) codes.add(generateSessionCode());
    expect(codes.size).toBe(50);
  });
});

describe('isValidSessionCode', () => {
  it('accepts a well-formed code', () => {
    expect(isValidSessionCode('ABCDEF')).toBe(true);
  });

  it('rejects wrong length', () => {
    expect(isValidSessionCode('ABC')).toBe(false);
  });

  it('rejects lowercase', () => {
    expect(isValidSessionCode('abcdef')).toBe(false);
  });

  it('rejects ambiguous characters', () => {
    expect(isValidSessionCode('ABC0EF')).toBe(false);
    expect(isValidSessionCode('ABC1EF')).toBe(false);
  });
});
