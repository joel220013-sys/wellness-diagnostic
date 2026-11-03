import { NextRequest, NextResponse } from 'next/server';
import { queryDb } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patient_id');

    const sql = `
      SELECT id, order_number, patient_id, patient_name, total_amount, payment_status, payment_method, created_at, items
      FROM public.bookings
      ORDER BY created_at DESC;
    `;

    const rows = await queryDb(sql);

    const invoices = rows.map((b: any) => {
      const invRef = (b.order_number || String(b.id)).replace(/^WD-/, 'INV-');
      return {
        id: `inv_${String(b.id).slice(0, 8)}`,
        invoice_number: invRef,
        booking_id: String(b.id),
        patient_id: String(b.patient_id || 'user_patient_1'),
        patient_name: b.patient_name || 'Patient',
        amount: Number(b.total_amount) || 0,
        status: b.payment_status || 'Pending',
        payment_method: b.payment_method || 'Cash on Collection',
        items: typeof b.items === 'string' ? JSON.parse(b.items) : (b.items || []),
        created_at: b.created_at ? String(b.created_at) : new Date().toISOString(),
      };
    });

    let filtered = invoices;
    if (patientId) {
      filtered = filtered.filter((i) => i.patient_id === patientId);
    }

    return NextResponse.json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (err: any) {
    console.error('[API /api/invoices GET error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
