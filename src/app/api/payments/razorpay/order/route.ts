import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder, RAZORPAY_KEY_ID } from '@/lib/server/razorpay';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, booking_reference, patient_name, patient_phone } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Valid amount is required' }, { status: 400 });
    }

    const order = await createRazorpayOrder({
      amount: Number(amount),
      receipt: booking_reference || `WD-${Date.now().toString().slice(-6)}`,
      notes: {
        patient_name: patient_name || 'Patient',
        patient_phone: patient_phone || '',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        key_id: RAZORPAY_KEY_ID || order.key_id,
        business_name: 'Wellness Diagnostic Center',
        description: 'Diagnostic Tests & Home Collection Fee',
      },
    });
  } catch (err: any) {
    console.error('[API /api/payments/razorpay/order error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
