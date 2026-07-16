import { describe, it, expect } from 'vitest';
import { NORMAL_RATE, SLOW_RATE, nextRate } from '@/lib/speech';

describe('nextRate', () => {
  it('alternates between normal and slow', () => {
    expect(nextRate(NORMAL_RATE)).toBe(SLOW_RATE);
    expect(nextRate(SLOW_RATE)).toBe(NORMAL_RATE);
  });

  // Taps run: normal, slow, normal, slow …
  it('cycles with repeated taps', () => {
    const rates = [NORMAL_RATE];
    for (let i = 0; i < 3; i++) rates.push(nextRate(rates[rates.length - 1]));
    expect(rates).toEqual([NORMAL_RATE, SLOW_RATE, NORMAL_RATE, SLOW_RATE]);
  });
});
