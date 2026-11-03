import { describe, test, expect } from 'vitest';
import { calculateTotal } from '../src/lib/pricing/calculate-total';

describe('Authoritative Server-Side Pricing & Invoicing (INR ₹)', () => {
  test('grants FREE doorstep collection when address is within 2.5 km of Lab', () => {
    // Nearby in Vidyanagar / Teachers Colony (~0.6 km from lab)
    const pricing = calculateTotal(
      [{ price: 399, quantity: 1 }],
      { latitude: 14.4450, longitude: 75.9300 }
    );
    expect(pricing.subtotal).toBe(399);
    expect(pricing.collectionFee).toBe(0);
    expect(pricing.isFreeDelivery).toBe(true);
    expect(pricing.discount).toBe(0);
    expect(pricing.totalAmount).toBe(399);
  });

  test('applies ₹50 delivery charge when address is above 2.5 km from Lab', () => {
    // Farther in Kuvempu Nagar / Davangere North (~5.1 km from lab)
    const pricing = calculateTotal(
      [{ price: 1999, quantity: 1 }],
      { latitude: 14.4820, longitude: 75.9110 }
    );
    expect(pricing.subtotal).toBe(1999);
    expect(pricing.collectionFee).toBe(50);
    expect(pricing.isFreeDelivery).toBe(false);
    expect(pricing.totalAmount).toBe(2049); // 1999 + 50
  });

  test('charges authoritative full price without bundle discount for 2 or more tests', () => {
    // Two tests: ₹600 + ₹400 = ₹1000 subtotal, within 2.5 km
    const pricing = calculateTotal(
      [
        { price: 600, quantity: 1 },
        { price: 400, quantity: 1 },
      ],
      { latitude: 14.4410, longitude: 75.9330 }
    );
    expect(pricing.subtotal).toBe(1000);
    expect(pricing.collectionFee).toBe(0);
    expect(pricing.discount).toBe(0);
    expect(pricing.totalAmount).toBe(1000);
  });
});
