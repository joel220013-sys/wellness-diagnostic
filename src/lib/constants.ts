export const BRAND = {
  name: 'Wellness Diagnostic',
  tagline: 'Precision Blood Diagnostics & Doorstep Phlebotomy Care',
  phone: '1800-419-WELL',
  email: 'support@wellnessdiagnostic.com',
  address: 'Sector 14 Diagnostic Hub, Connaught Place, New Delhi 110001',
  currency: '₹',
  currencyCode: 'INR',
  timezone: 'Asia/Kolkata',
  colors: {
    primaryGreen: '#08784E',
    darkGreen: '#18352E',
    warmPeach: '#F6B58D',
    ivoryBg: '#FFF9F2',
    white: '#FFFFFF',
  },
};

export const PRICING_RULES = {
  freeCollectionThreshold: 999, // INR
  standardCollectionFee: 150,   // INR
  bundleDiscountPercent: 10,    // 10% for 2+ tests
  taxRate: 0,                   // Clinical pathology is GST exempt
};

export const TIME_SLOTS = [
  '06:00 AM – 07:30 AM',
  '07:30 AM – 09:00 AM',
  '09:00 AM – 10:30 AM',
  '10:30 AM – 12:00 PM',
  '04:00 PM – 05:30 PM',
  '05:30 PM – 07:00 PM',
] as const;

export const BOOKING_STATUSES = [
  'Pending',
  'Confirmed',
  'Assigned',
  'Collection Scheduled',
  'Sample Collected',
  'Processing',
  'Report Ready',
  'Cancelled',
  'Failed',
] as const;
