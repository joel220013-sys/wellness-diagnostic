import { LAB_LOCATION, PRICING_RULES } from '@/lib/constants';

export interface CalculatedTotal {
  subtotal: number;
  collectionFee: number;
  discount: number;
  taxAmount: number;
  totalAmount: number;
  distanceKm?: number | null;
  isFreeDelivery?: boolean;
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

export function calculateTotal(
  items: Array<{ price: number; quantity?: number }>,
  coords?: { latitude?: number; longitude?: number } | null
): CalculatedTotal {
  const subtotal = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  let distanceKm: number | null = null;
  let isFreeDelivery = true;
  let collectionFee = 0;

  if (
    coords && 
    typeof coords.latitude === 'number' && 
    typeof coords.longitude === 'number' &&
    !isNaN(coords.latitude) && 
    !isNaN(coords.longitude)
  ) {
    distanceKm = calculateDistanceKm(
      LAB_LOCATION.latitude,
      LAB_LOCATION.longitude,
      coords.latitude,
      coords.longitude
    );
    if (distanceKm > PRICING_RULES.freeDeliveryRadiusKm) {
      isFreeDelivery = false;
      collectionFee = subtotal === 0 ? 0 : PRICING_RULES.deliveryChargeAboveRadius;
    } else {
      isFreeDelivery = true;
      collectionFee = 0;
    }
  } else {
    // If no coordinates provided, default to free within 2.5 km
    collectionFee = 0;
    isFreeDelivery = true;
  }

  const discount = 0; // Permanently removed multi-test bundle discount
  const taxAmount = 0; // Clinical pathology healthcare services are exempt from GST
  const totalAmount = Math.max(0, subtotal + collectionFee + taxAmount);

  return {
    subtotal,
    collectionFee,
    discount,
    taxAmount,
    totalAmount,
    distanceKm,
    isFreeDelivery,
  };
}
