import { NextRequest, NextResponse } from 'next/server';
import { queryDb } from '@/lib/server/db';
import { getPresignedDownloadUrl } from '@/lib/server/r2';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patient_id');
    const bookingId = searchParams.get('booking_id');

    let sql = `
      SELECT r.*, b.order_number, b.patient_name, b.items
      FROM public.reports r
      LEFT JOIN public.bookings b ON r.booking_id = b.id
      ORDER BY r.created_at DESC;
    `;

    const rows = await queryDb(sql);

    const reportsWithUrls = await Promise.all(
      rows.map(async (r: any) => {
        let presignedUrl = null;
        if (r.file_path) {
          presignedUrl = await getPresignedDownloadUrl(r.file_path, 86400, `${r.report_number || 'report'}.pdf`);
        }

        return {
          id: String(r.id),
          report_number: r.report_number || `WD-REP-${r.id.slice(0, 6)}`,
          booking_id: r.booking_id ? String(r.booking_id) : null,
          booking_reference: r.order_number || '',
          patient_id: r.patient_id ? String(r.patient_id) : 'user_patient_1',
          patient_name: r.patient_name || 'Patient',
          file_path: r.file_path || '',
          file_url: presignedUrl || `/api/reports/${r.id}/download`,
          download_url: `/api/reports/${r.id}/download`,
          r2_url: presignedUrl,
          status: r.status || 'Released',
          doctor_name: r.doctor_name || 'Chief Pathologist, MD',
          lab_technician: r.lab_technician || 'Senior Technician',
          overall_remarks: r.overall_remarks || '',
          created_at: r.created_at ? String(r.created_at) : new Date().toISOString(),
        };
      })
    );

    let filtered = reportsWithUrls;
    if (patientId) {
      filtered = filtered.filter((r) => r.patient_id === patientId);
    }
    if (bookingId) {
      filtered = filtered.filter((r) => r.booking_id === bookingId || r.booking_reference === bookingId);
    }

    return NextResponse.json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (err: any) {
    console.error('[API /api/reports GET error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
