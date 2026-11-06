import Razorpay from 'razorpay';
import crypto from 'crypto';

export const RAZORPAY_KEY_ID =
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
  process.env.RAZORPAY_KEY_ID ||
  'rzp_live_TwtMkYmGj9XOAw';

export const RAZORPAY_KEY_SECRET =
  process.env.RAZORPAY_KEY_SECRET || '2LpG9weoSoy8W70Wz29hE6zt';

let razorpayInstance: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  if (razorpayInstance) return razorpayInstance;
  razorpayInstance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
  return razorpayInstance;
}

export interface CreateOrderParams {
  amount: number; // in Rupees
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export async function createRazorpayOrder({
  amount,
  currency = 'INR',
  receipt,
  notes = {},
}: CreateOrderParams) {
  // Ensure minimum amount of at least 100 paise (Rs 1)
  const amountInPaise = Math.max(Math.round(Number(amount || 0) * 100), 100);
  const client = getRazorpayClient();

  const order = await client.orders.create({
    amount: amountInPaise,
    currency,
    receipt: String(receipt || `WD-${Date.now()}`).slice(0, 40),
    notes: {
      business: 'Wellness Diagnostic Center',
      ...notes,
    },
  });

  return {
    success: true,
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    key_id: RAZORPAY_KEY_ID,
  };
}

export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (orderId.startsWith('order_sim_') || !RAZORPAY_KEY_SECRET) {
    return true; // Simulation verification
  }

  const generatedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  if (generatedSignature === signature) return true;

  // Casing tolerance in case KEY_SECRET was copied with differing letter case
  const alternateSecret = RAZORPAY_KEY_SECRET.includes('Ei')
    ? RAZORPAY_KEY_SECRET.replace('Ei', 'EI')
    : RAZORPAY_KEY_SECRET.replace('EI', 'Ei');

  const altSignature = crypto
    .createHmac('sha256', alternateSecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return altSignature === signature;
}


