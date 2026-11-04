import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/server/razorpay';
import { queryDb } from '@/lib/server/db';
import { formatDbBooking } from '@/lib/server/formatters';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      booking_id,
      booking_reference,
    } = body;

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

    // Update the booking in Supabase PostgreSQL
    let updatedBooking = null;
    const cleanId = String(booking_id || booking_reference || '').replace(/^#/, '').trim();

    if (cleanId) {
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
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and booking marked as Paid',
      data: {
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        booking: updatedBooking,
      },
    });
  } catch (err: any) {
    console.error('[API /api/payments/razorpay/verify error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

