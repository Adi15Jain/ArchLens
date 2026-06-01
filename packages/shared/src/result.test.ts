import { describe, it, expect } from 'vitest';
import { Ok, Err, isOk, isErr, unwrap } from './result.js';

describe('Result Type Helpers', () => {
  it('should create an Ok result', () => {
    const res = Ok(42);
    expect(res.ok).toBe(true);
    expect((res as any).value).toBe(42);
    expect(isOk(res)).toBe(true);
    expect(isErr(res)).toBe(false);
    expect(unwrap(res)).toBe(42);
  });

  it('should create an Err result', () => {
    const res = Err('Oops');
    expect(res.ok).toBe(false);
    expect((res as any).error).toBe('Oops');
    expect(isOk(res)).toBe(false);
    expect(isErr(res)).toBe(true);
  });
});
