import { NextRequest, NextResponse } from 'next/server';
import { queryDb } from '@/lib/server/db';
import { formatDbBooking } from '@/lib/server/formatters';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = decodeURIComponent(id).replace(/^#/, '').trim();

    const sql = `
      SELECT b.*, p.name as driver_name, p.phone as driver_phone, p.badge_id as driver_badge_id
      FROM public.bookings b
      LEFT JOIN public.profiles p ON b.assigned_driver_id = p.id
      WHERE b.id::text = $1 OR b.order_number = $1
      LIMIT 1;
    `;

    const rows = await queryDb(sql, [cleanId]);
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: formatDbBooking(rows[0]),
    });
  } catch (err: any) {
    console.error('[API /api/bookings/[id] GET error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = decodeURIComponent(id).replace(/^#/, '').trim();
    const body = await req.json();

    const updates: string[] = ['updated_at = NOW()'];
    const values: any[] = [];
    let idx = 1;

    if (body.status !== undefined) {
      updates.push(`status = $${idx++}`);
      values.push(body.status);
    }

    if (body.assigned_driver_id !== undefined || body.driver_id !== undefined) {
      const driverId = body.assigned_driver_id || body.driver_id;
      updates.push(`assigned_driver_id = $${idx++}`);
      values.push(driverId ? String(driverId) : null);
    }

    if (body.sample_details !== undefined) {
      updates.push(`sample_details = $${idx++}`);
      values.push(JSON.stringify(body.sample_details));
    }

    if (body.payment_status !== undefined) {
      updates.push(`payment_status = $${idx++}`);
      values.push(body.payment_status);
    }

    if (body.report_id !== undefined) {
      updates.push(`report_id = $${idx++}`);
      values.push(body.report_id);
    }

    values.push(cleanId);
    const updateSql = `
      UPDATE public.bookings
      SET ${updates.join(', ')}
      WHERE id::text = $${idx} OR order_number = $${idx}
      RETURNING *;
    `;

    const rows = await queryDb(updateSql, values);
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Booking not found to update' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully',
      data: formatDbBooking(rows[0]),
    });
  } catch (err: any) {
    console.error('[API /api/bookings/[id] PATCH error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
