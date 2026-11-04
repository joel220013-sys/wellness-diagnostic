import Razorpay from 'razorpay';
import crypto from 'crypto';

export const RAZORPAY_KEY_ID =
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '';
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

let razorpayInstance: Razorpay | null = null;

export function getRazorpayClient(): Razorpay | null {
  if (razorpayInstance) return razorpayInstance;
  if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
    razorpayInstance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
    return razorpayInstance;
  }
  return null;
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
  const amountInPaise = Math.round(amount * 100);
  const client = getRazorpayClient();

  if (client) {
    const order = await client.orders.create({
      amount: amountInPaise,
      currency,
      receipt: receipt.slice(0, 40),
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
      mode: 'live_or_test',
    };
  }

  // Simulation mode if key is not yet set in environment
  const mockOrderId = `order_sim_${Date.now()}`;
  return {
    success: true,
    order_id: mockOrderId,
    amount: amountInPaise,
    currency,
    key_id: RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    mode: 'simulation',
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

  return generatedSignature === signature;
}
