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

function parseNumericPrice(val: any): number {
  if (typeof val === 'number') {
    return isNaN(val) ? 0 : val;
  }
  if (typeof val === 'string') {
    const cleaned = parseFloat(val.replace(/[^0-9.]/g, ''));
    return isNaN(cleaned) ? 0 : cleaned;
  }
  return 0;
}

export function calculateOrderPricing(
  itemsOrIds: Array<any>, 
  availableItems?: Array<{ id: string; name: string; price: number }>
): PricingCalculation {
  const catalog = availableItems || [];
  let items: Array<{ id: string; name: string; price: number }> = [];

  if (Array.isArray(itemsOrIds)) {
    items = itemsOrIds
      .map((item) => {
        // 1. If it's already an object with id/name/price (e.g. DiagnosticTest from selectedTests)
        if (item && typeof item === 'object') {
          const testId = String(item.id || item.test_id || '');
          const testName = String(item.name || item.item_name || 'Diagnostic Test');
          const testPrice = parseNumericPrice(item.price ?? item.unit_price ?? item.original_price);
          
          if (testPrice > 0) {
            return { id: testId, name: testName, price: testPrice };
          }
          const found = catalog.find((pkg) => 
            pkg.id === testId || 
            (pkg.name && testName && pkg.name.toLowerCase().trim() === testName.toLowerCase().trim())
          );
          return {
            id: testId,
            name: found?.name || testName,
            price: parseNumericPrice(found?.price ?? testPrice),
          };
        }

        // 2. If it's a string testId or testName
        if (typeof item === 'string') {
          const cleanItem = item.trim().toLowerCase();
          const found = catalog.find((pkg) => 
            pkg.id === item || 
            pkg.id?.toLowerCase() === cleanItem || 
            (pkg.name && pkg.name.toLowerCase().trim() === cleanItem)
          );
          if (found) {
            return {
              id: found.id,
              name: found.name,
              price: parseNumericPrice(found.price),
            };
          }
        }
        return null;
      })
      .filter((pkg): pkg is NonNullable<typeof pkg> => Boolean(pkg));
  }

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
