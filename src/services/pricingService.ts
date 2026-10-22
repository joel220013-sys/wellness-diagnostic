import { TEST_PACKAGES } from '@/data/mockData';

export interface PricingCalculation {
  subtotal: number;
  collectionFee: number;
  discount: number;
  tax: number;
  total: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

export function calculateOrderPricing(testIds: string[]): PricingCalculation {
  const items = testIds
    .map((id) => TEST_PACKAGES.find((pkg) => pkg.id === id))
    .filter((pkg): pkg is NonNullable<typeof pkg> => Boolean(pkg))
    .map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
    }));

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

  // Policy: Free home collection for orders >= ₹999, else ₹150 collection fee
  const collectionFee = subtotal >= 999 || subtotal === 0 ? 0 : 150;
  
  // Package bundling discount (10% off when 2+ tests selected)
  const discount = items.length >= 2 ? Math.round(subtotal * 0.1) : 0;
  
  const tax = 0; // Clinical diagnostic healthcare services are GST-exempt
  const total = Math.max(0, subtotal + collectionFee - discount);

  return {
    subtotal,
    collectionFee,
    discount,
    tax,
    total,
    items,
  };
}
