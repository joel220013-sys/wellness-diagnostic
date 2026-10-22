import { PRICING_RULES } from '@/lib/constants';

export interface CalculatedTotal {
  subtotal: number;
  collectionFee: number;
  discount: number;
  taxAmount: number;
  totalAmount: number;
}

export function calculateTotal(items: Array<{ price: number; quantity?: number }>): CalculatedTotal {
  const subtotal = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  const collectionFee =
    subtotal === 0 || subtotal >= PRICING_RULES.freeCollectionThreshold
      ? 0
      : PRICING_RULES.standardCollectionFee;

  const discount =
    items.length >= 2
      ? Math.round((subtotal * PRICING_RULES.bundleDiscountPercent) / 100)
      : 0;

  const taxAmount = 0; // Clinical pathology healthcare services are exempt from GST

  const totalAmount = Math.max(0, subtotal + collectionFee - discount + taxAmount);

  return {
    subtotal,
    collectionFee,
    discount,
    taxAmount,
    totalAmount,
  };
}
