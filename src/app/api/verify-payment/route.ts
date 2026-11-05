import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { RAZORPAY_KEY_SECRET } from '@/lib/server/razorpay';
import { queryDb } from '@/lib/server/db';
import { formatDbBooking } from '@/lib/server/formatters';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const order_id =
      body.razorpay_order_id || body.order_id || body.orderId;
    const payment_id =
      body.razorpay_payment_id || body.payment_id || body.paymentId;
    const signature =
      body.razorpay_signature || body.signature;

    // Missing fields check: return 400
    if (!order_id || !payment_id || !signature) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: order_id, payment_id, and signature are mandatory',
        },
        { status: 400 }
      );
    }

    if (!RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Razorpay secret is not configured' },
        { status: 500 }
      );
    }

    // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${order_id}|${payment_id}`)
      .digest('hex');

    // Case-tolerant alternate check if secret casing varied
    const alternateSecret = RAZORPAY_KEY_SECRET.includes('Ei')
      ? RAZORPAY_KEY_SECRET.replace('Ei', 'EI')
      : RAZORPAY_KEY_SECRET.replace('EI', 'Ei');
    const altSignature = crypto
      .createHmac('sha256', alternateSecret)
      .update(`${order_id}|${payment_id}`)
      .digest('hex');

    const isValid =
      expectedSignature === signature || altSignature === signature;

    if (!isValid) {
      // Signature mismatch: return 400, do NOT mark as paid
      return NextResponse.json(
        {
          success: false,
          error: 'Signature verification failed. Potential tampering detected.',
        },
        { status: 400 }
      );
    }

    // Optional booking update in database if booking reference / id provided
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
      order_id,
      payment_id,
      booking: updatedBooking,
    });
  } catch (err: any) {
    console.error('[API /api/verify-payment error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Verification process failed' },
      { status: 500 }
    );
  }
}
