import { NextRequest, NextResponse } from 'next/server';
import { queryDb } from '@/lib/server/db';
import { formatDbBooking } from '@/lib/server/formatters';
import { sendAssignmentPatientSMS, sendAssignmentDriverSMS } from '@/lib/smsService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { booking_id, driver_id, driver_name, driver_phone } = body;

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
    const updated = rows[0];

    // Query driver details from profiles if not fully passed
    let resolvedDriverPhone = driver_phone || '';
    let resolvedDriverName = driver_name || '';

    if (driver_id && (!resolvedDriverPhone || !resolvedDriverName)) {
      try {
        const driverRows = await queryDb(
          `SELECT name, phone FROM public.profiles WHERE id::text = $1 LIMIT 1;`,
          [String(driver_id)]
        );
        if (driverRows[0]) {
          resolvedDriverName = resolvedDriverName || driverRows[0].name;
          resolvedDriverPhone = resolvedDriverPhone || driverRows[0].phone;
        }
      } catch (err) {
        console.warn('[Driver Profile Fetch warn]:', err);
      }
    }

    // Trigger Automated Real SMS Alerts to Patient and Driver
    if (updated && resolvedDriverName) {
      const patientName = updated.patient_name || 'Patient';
      const patientPhone = updated.patient_phone || '';
      const bookingRef = updated.order_number || cleanId;
      const slot = `${updated.scheduled_date || ''} (${updated.scheduled_slot || ''})`.trim();
      const addr = updated.address_snapshot || {};
      const addressText =
        [addr.address_line_1, addr.locality || addr.address_line_2, addr.city]
          .filter(Boolean)
          .join(', ') || 'Davanagere';
      const lat = addr.latitude;
      const lng = addr.longitude;

      Promise.allSettled([
        patientPhone
          ? sendAssignmentPatientSMS({
              patientName,
              patientPhone,
              bookingReference: bookingRef,
              scheduledSlot: slot,
              driverName: resolvedDriverName,
              driverPhone: resolvedDriverPhone || 'Lab Phlebotomy Dispatch',
            })
          : Promise.resolve(),
        resolvedDriverPhone
          ? sendAssignmentDriverSMS({
              driverName: resolvedDriverName,
              driverPhone: resolvedDriverPhone,
              bookingReference: bookingRef,
              patientName,
              patientPhone,
              scheduledSlot: slot,
              addressText,
              latitude: lat,
              longitude: lng,
            })
          : Promise.resolve(),
      ]).catch((e) => console.warn('[SMS Assignment error]:', e));
    }

    return NextResponse.json({
      success: true,
      message: `Successfully assigned phlebotomist`,
      data: updated
        ? formatDbBooking(updated)
        : { booking_id, assigned_driver_id: driver_id, assigned_driver_name: resolvedDriverName },
    });
  } catch (err: any) {
    console.error('[API /api/admin/assignments POST error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
