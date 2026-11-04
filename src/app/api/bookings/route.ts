import { NextRequest, NextResponse } from 'next/server';
import { queryDb } from '@/lib/server/db';
import { formatDbBooking } from '@/lib/server/formatters';
import crypto from 'crypto';

function toSafeUuid(val: any): string {
  if (!val) return crypto.randomUUID();
  const str = String(val).trim();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) {
    return str;
  }
  // Generate deterministic UUIDv5-like hash or random UUID
  const hash = crypto.createHash('md5').update(str).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patient_id');
    const status = searchParams.get('status');

    const sql = `
      SELECT b.*, p.name as driver_name, p.phone as driver_phone, p.badge_id as driver_badge_id
      FROM public.bookings b
      LEFT JOIN public.profiles p ON b.assigned_driver_id = p.id
      ORDER BY b.created_at DESC;
    `;

    const rows = await queryDb(sql);
    let bookings = rows.map(formatDbBooking);

    if (patientId) {
      bookings = bookings.filter((b) => b.patient_id === patientId);
    }
    if (status && status.toUpperCase() !== 'ALL') {
      bookings = bookings.filter((b) => String(b.status).toLowerCase() === status.toLowerCase());
    }

    return NextResponse.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err: any) {
    console.error('[API /api/bookings GET error]', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const bookingId = body.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.id)
      ? body.id
      : crypto.randomUUID();

    let ref = body.booking_reference;
    if (!ref) {
      const hex = crypto.randomBytes(2).toString('hex').toUpperCase();
      ref = `WD-2026-${hex}`;
    }

    const patientUuid = toSafeUuid(body.patient_id || 'user_patient_1');
    const patientName = body.patient_name || 'Patient';
    const patientPhone = body.patient_phone || '';
    const scheduledDate = body.scheduled_date || new Date().toISOString().split('T')[0];
    const scheduledSlot = body.scheduled_slot || body.time_slot || '07:30 AM – 09:00 AM';
    const totalAmount = Number(body.total_amount) || 0;
    const subtotal = Number(body.subtotal ?? totalAmount) || 0;
    const collectionFee = Number(body.collection_fee) || 0;
    const paymentStatus = body.payment_status || 'Pending';
    const paymentMethod = body.payment_method || 'Cash on Collection';
    const patientNotes = body.patient_notes || '';
    const addressSnapshot = JSON.stringify(body.address_snapshot || {});
    const items = JSON.stringify(body.items || []);

    const insertSql = `
      INSERT INTO public.bookings (
        id, order_number, patient_id, patient_name, patient_phone,
        collection_date, time_slot, scheduled_date, scheduled_slot,
        status, total_amount, subtotal, collection_fee,
        payment_status, payment_method, address_snapshot,
        items, patient_notes, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        'Pending', $10, $11, $12,
        $13, $14, $15,
        $16, $17, NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        updated_at = NOW()
      RETURNING *;
    `;

    let rows: any[] = [];
    try {
      rows = await queryDb(insertSql, [
        bookingId,
        ref,
        patientUuid,
        patientName,
        patientPhone,
        scheduledDate,
        scheduledSlot,
        scheduledDate,
        scheduledSlot,
        totalAmount,
        subtotal,
        collectionFee,
        paymentStatus,
        paymentMethod,
        addressSnapshot,
        items,
        patientNotes,
      ]);
    } catch (dbErr: any) {
      // If there's an order_number collision, generate a new random ref
      if (dbErr.code === '23505') {
        const altRef = `WD-2026-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        rows = await queryDb(insertSql, [
          bookingId,
          altRef,
          patientUuid,
          patientName,
          patientPhone,
          scheduledDate,
          scheduledSlot,
          scheduledDate,
          scheduledSlot,
          totalAmount,
          subtotal,
          collectionFee,
          paymentStatus,
          paymentMethod,
          addressSnapshot,
          items,
          patientNotes,
        ]);
      } else {
        throw dbErr;
      }
    }

    const createdBooking = rows[0] ? formatDbBooking(rows[0]) : {
      id: bookingId,
      booking_reference: ref,
      order_number: ref,
      patient_id: patientUuid,
      patient_name: patientName,
      patient_phone: patientPhone,
      scheduled_date: scheduledDate,
      scheduled_slot: scheduledSlot,
      status: 'Pending',
      total_amount: totalAmount,
      subtotal,
      collection_fee: collectionFee,
      payment_status: paymentStatus,
      payment_method: paymentMethod,
      address_snapshot: body.address_snapshot || {},
      items: body.items || [],
      patient_notes: patientNotes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Booking registered successfully',
      data: createdBooking,
    });
  } catch (err: any) {
    console.error('[API /api/bookings POST error]', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}

