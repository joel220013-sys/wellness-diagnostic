import { NextRequest, NextResponse } from 'next/server';
import { queryDb } from '@/lib/server/db';
import { formatDbBooking } from '@/lib/server/formatters';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { booking_id, driver_id, driver_name } = body;

    if (!booking_id) {
      return NextResponse.json({ success: false, error: 'booking_id is required' }, { status: 400 });
    }

    const cleanId = String(booking_id).replace(/^#/, '').trim();

    const sql = `
      UPDATE public.bookings
      SET assigned_driver_id = $1, status = 'Assigned', updated_at = NOW()
      WHERE id::text = $2 OR order_number = $2 OR order_number = $3
      RETURNING *;
    `;

    const rows = await queryDb(sql, [driver_id ? String(driver_id) : null, cleanId, `#${cleanId}`]);

    return NextResponse.json({
      success: true,
      message: `Successfully assigned phlebotomist`,
      data: rows[0] ? formatDbBooking(rows[0]) : { booking_id, assigned_driver_id: driver_id, assigned_driver_name: driver_name },
    });
  } catch (err: any) {
    console.error('[API /api/admin/assignments POST error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
