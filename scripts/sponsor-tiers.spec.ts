import { describe, expect, it } from 'vitest';
import { getTierSlug } from './sponsor-tiers.js';

describe('sponsor tiers', () => {
  it('rejects a $100 monthly order with only two $1 payments', () => {
    expect(getTierSlug(100, 2)).toBeNull();
  });

  it('rejects an unpaid order', () => {
    expect(getTierSlug(250, 0)).toBeNull();
  });

  it('caps recognition when an order amount increases before payment', () => {
    expect(getTierSlug(250, 100)).toBe('sponsor');
  });

  it('keeps fully paid sponsors in their tier', () => {
    expect(getTierSlug(100, 100)).toBe('sponsor');
    expect(getTierSlug(250, 1130)).toBe('headliner');
  });

  it('does not promote a small monthly contribution based on lifetime donations', () => {
    expect(getTierSlug(5, 1000)).toBe('backer');
  });

  it('recognizes a paid annual contribution at its monthly equivalent', () => {
    expect(getTierSlug(100, 1200)).toBe('sponsor');
  });

  it.each([
    [0, null],
    [4.99, null],
    [5, 'backer'],
    [24.99, 'backer'],
    [25, 'professional'],
    [99.99, 'professional'],
    [100, 'sponsor'],
    [249.99, 'sponsor'],
    [250, 'headliner'],
  ] as const)(
    'preserves the $%s monthly tier when no payment total is supplied',
    (amount, tier) => {
      expect(getTierSlug(amount)).toBe(tier);
    },
  );
});
