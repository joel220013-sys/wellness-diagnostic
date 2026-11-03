import { describe, test, expect } from 'vitest';
import { calculateTotal } from '../src/lib/pricing/calculate-total';

describe('Authoritative Server-Side Pricing & Invoicing (INR ₹)', () => {
  test('adds flat ₹50 doorstep collection fee to single test booking', () => {
    // Single CBC test @ ₹399
    const pricing = calculateTotal([{ price: 399, quantity: 1 }]);
    expect(pricing.subtotal).toBe(399);
    expect(pricing.collectionFee).toBe(50);
    expect(pricing.discount).toBe(0);
    expect(pricing.totalAmount).toBe(449); // 399 + 50
  });

  test('adds flat ₹50 doorstep collection fee to full body checkup package', () => {
    // Full body package @ ₹1999
    const pricing = calculateTotal([{ price: 1999, quantity: 1 }]);
    expect(pricing.subtotal).toBe(1999);
    expect(pricing.collectionFee).toBe(50);
    expect(pricing.totalAmount).toBe(2049); // 1999 + 50
  });

  test('charges authoritative full price with flat ₹50 collection fee for multiple tests', () => {
    // Two tests: ₹600 + ₹400 = ₹1000 subtotal
    const pricing = calculateTotal([
      { price: 600, quantity: 1 },
      { price: 400, quantity: 1 },
    ]);
    expect(pricing.subtotal).toBe(1000);
    expect(pricing.collectionFee).toBe(50);
    expect(pricing.discount).toBe(0); // Permanently removed bundle discount
    expect(pricing.totalAmount).toBe(1050); // 1000 + 50
  });
});
