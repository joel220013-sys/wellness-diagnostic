import { describe, test, expect } from 'vitest';
import { calculateTotal } from '../src/lib/pricing/calculate-total';

describe('Authoritative Server-Side Pricing & Invoicing (INR ₹)', () => {
  test('applies ₹150 collection fee when subtotal is below ₹999 threshold', () => {
    // Single CBC test @ ₹399
    const pricing = calculateTotal([{ price: 399, quantity: 1 }]);
    expect(pricing.subtotal).toBe(399);
    expect(pricing.collectionFee).toBe(150);
    expect(pricing.discount).toBe(0);
    expect(pricing.totalAmount).toBe(549);
  });

  test('grants FREE doorstep collection when subtotal >= ₹999', () => {
    // Full body test @ ₹1999
    const pricing = calculateTotal([{ price: 1999, quantity: 1 }]);
    expect(pricing.subtotal).toBe(1999);
    expect(pricing.collectionFee).toBe(0);
    expect(pricing.totalAmount).toBe(1999);
  });

  test('applies 10% multi-test bundle discount for 2 or more tests', () => {
    // Two tests: ₹600 + ₹400 = ₹1000 subtotal
    const pricing = calculateTotal([
      { price: 600, quantity: 1 },
      { price: 400, quantity: 1 },
    ]);
    expect(pricing.subtotal).toBe(1000);
    expect(pricing.collectionFee).toBe(0); // >= 999
    expect(pricing.discount).toBe(100); // 10% of 1000
    expect(pricing.totalAmount).toBe(900);
  });
});
