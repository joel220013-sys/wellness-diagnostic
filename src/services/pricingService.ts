import { PRICING_RULES } from '@/lib/constants';

export interface PricingCalculation {
  subtotal: number;
  collectionFee: number;
  discount: number;
  tax: number;
  total: number;
  distanceKm: number | null;
  isFreeDelivery: boolean;
  deliveryLabel: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
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
  availableItems?: Array<{ id: string; name: string; price: number }>,
  patientCoords?: { latitude?: number; longitude?: number } | null
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

  // Policy: Flat standard ₹50 Doorstep Collection Fee for home collections
  const collectionFee = subtotal > 0 ? (PRICING_RULES.standardDeliveryFee || 50) : 0;
  const deliveryLabel = collectionFee > 0 ? '₹50 Standard Home Collection' : '₹0';
  
  // Permanently removed multi-test bundle discount
  const discount = 0;
  
  const tax = 0; // Clinical diagnostic healthcare services are GST-exempt
  const total = Math.max(0, subtotal + collectionFee);

  return {
    subtotal,
    collectionFee,
    discount,
    tax,
    total,
    distanceKm: null,
    isFreeDelivery: false,
    deliveryLabel,
    items,
  };
}
