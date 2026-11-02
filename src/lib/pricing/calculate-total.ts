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

  const discount = 0; // Permanently removed multi-test bundle discount

  const taxAmount = 0; // Clinical pathology healthcare services are exempt from GST

  const totalAmount = Math.max(0, subtotal + collectionFee + taxAmount);

  return {
    subtotal,
    collectionFee,
    discount,
    taxAmount,
    totalAmount,
  };
}
