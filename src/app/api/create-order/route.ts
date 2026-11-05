import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '@/lib/server/razorpay';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { amount, currency = 'INR', receipt, notes } = body;

    // Razorpay requires amount in paise (minimum 100 paise = Rs 1)
    if (!amount) {
      return NextResponse.json(
        { success: false, error: 'Amount is required' },
        { status: 400 }
      );
    }

    // Handle amount in paise or rupees:
    // If amount < 100 (e.g. Rs 50), convert to paise (50 * 100 = 5000 paise)
    // If amount is already in paise (e.g. 5000 paise or 100 paise), keep as is
    let amountInPaise = Number(amount);
    if (body.is_rupees || amountInPaise < 100) {
      amountInPaise = Math.round(amountInPaise * 100);
    }

    if (amountInPaise < 100) {
      return NextResponse.json(
        { success: false, error: 'Minimum amount must be at least 100 paise (Rs 1)' },
        { status: 400 }
      );
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Razorpay credentials not configured' },
        { status: 401 }
      );
    }

    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

    const receiptStr = String(receipt || `rcpt_${Date.now().toString().slice(-8)}`).slice(0, 40);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: currency || 'INR',
      receipt: receiptStr,
      notes: {
        business: 'Wellness Diagnostic Center',
        ...notes,
      },
    });

    return NextResponse.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    console.error('[API /api/create-order error]:', err);
    if (err?.statusCode === 401 || err?.error?.code === 'BAD_REQUEST_ERROR') {
      return NextResponse.json(
        { success: false, error: err?.error?.description || 'Authentication failed' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: err?.error?.description || err.message || 'Razorpay order creation failed' },
      { status: 500 }
    );
  }
}
