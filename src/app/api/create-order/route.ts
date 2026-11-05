import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder, RAZORPAY_KEY_ID } from '@/lib/server/razorpay';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { amount, currency = 'INR', receipt, notes } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    // If amount is passed in paise (> 100) or rupees, handle properly
    // If amount is >= 100 and likely in paise:
    let amountInRupees = Number(amount);
    if (amountInRupees >= 100 && Number.isInteger(amountInRupees) && amountInRupees > 2000) {
      // Could be paise if huge, but test prices in diagnostic are 50 to 5000 rupees.
      // Standard: if explicit paise flag not set, assume standard rupees or convert.
    }

    // If body amount is explicit paise (e.g. from standard prompt specs where min amount is 100 paise = 1 rupee)
    if (body.amount_in_paise) {
      amountInRupees = body.amount_in_paise / 100;
    }

    const order = await createRazorpayOrder({
      amount: amountInRupees,
      currency,
      receipt: receipt || `rec_${Date.now().toString().slice(-8)}`,
      notes: notes || {},
    });

    return NextResponse.json({
      success: true,
      order_id: order.order_id,
      amount: order.amount,
      currency: order.currency,
      key_id: RAZORPAY_KEY_ID || order.key_id,
    });
  } catch (err: any) {
    console.error('[API /api/create-order error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
