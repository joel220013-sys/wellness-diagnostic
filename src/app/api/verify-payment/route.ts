import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/server/razorpay';
import { queryDb } from '@/lib/server/db';
import { formatDbBooking } from '@/lib/server/formatters';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const razorpay_order_id =
      body.razorpay_order_id || body.order_id || body.orderId;
    const razorpay_payment_id =
      body.razorpay_payment_id || body.payment_id || body.paymentId;
    const razorpay_signature =
      body.razorpay_signature || body.signature;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing required payment verification fields' },
        { status: 400 }
      );
    }

    const isValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Payment signature verification failed' },
        { status: 400 }
      );
    }

    // Optional booking update if booking_id provided
    const cleanId = String(body.booking_id || body.booking_reference || '').replace(/^#/, '').trim();
    let updatedBooking = null;

    if (cleanId) {
      try {
        const sql = `
          UPDATE public.bookings
          SET 
            payment_status = 'Paid',
            payment_method = 'Online / Razorpay',
            updated_at = NOW()
          WHERE id::text = $1 OR order_number = $1 OR order_number = $2
          RETURNING *;
        `;
        const rows = await queryDb(sql, [cleanId, `#${cleanId}`]);
        if (rows[0]) {
          updatedBooking = formatDbBooking(rows[0]);
        }
      } catch (dbErr) {
        console.warn('[verify-payment DB update warning]', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment signature verified successfully',
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      booking: updatedBooking,
    });
  } catch (err: any) {
    console.error('[API /api/verify-payment error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
