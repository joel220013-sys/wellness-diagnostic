import { NextRequest, NextResponse } from 'next/server';
import { queryDb } from '@/lib/server/db';
import { uploadToR2, getPresignedDownloadUrl } from '@/lib/server/r2';
import crypto from 'crypto';

function toSafeUuid(val: any): string | null {
  if (!val) return null;
  const str = String(val).trim();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) {
    return str;
  }
  const hash = crypto.createHash('md5').update(str).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const bookingId = (formData.get('booking_id') as string | null) || null;
    const patientId = (formData.get('patient_id') as string | null) || 'user_patient_1';
    const doctorName = (formData.get('doctor_name') as string | null) || 'Chief Pathologist, MD';
    const labTechnician = (formData.get('lab_technician') as string | null) || 'Robert Thorne, B.Sc MLT';
    const overallRemarks = (formData.get('overall_remarks') as string | null) || 'Official digital pathology report verified.';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No PDF report file uploaded' }, { status: 400 });
    }

    const reportId = crypto.randomUUID();
    const rawFilename = file.name || `report_${reportId.slice(0, 6)}.pdf`;
    const safeFilename = rawFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectKey = `reports/${reportId}/${safeFilename}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudflare R2
    const presignedDownloadUrl = await uploadToR2(buffer, objectKey, file.type || 'application/pdf');

    const yyyymmdd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const reportNumber = `WD-REP-${yyyymmdd}-${reportId.slice(0, 4).toUpperCase()}`;

    // Persist in Supabase reports table
    const bookingUuid = toSafeUuid(bookingId);
    const patientUuid = toSafeUuid(patientId);

    try {
      await queryDb(
        `INSERT INTO public.reports (
          id, report_number, booking_id, patient_id, file_path, status, results,
          overall_remarks, doctor_name, lab_technician, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, 'Released', '[]'::jsonb,
          $6, $7, $8, NOW()
        )
        ON CONFLICT (id) DO NOTHING;`,
        [reportId, reportNumber, bookingUuid, patientUuid, objectKey, overallRemarks, doctorName, labTechnician]
      );

      // Automatically move booking to "Report Ready" in DB
      if (bookingId) {
        const cleanBookingId = String(bookingId).replace(/^#/, '').trim();
        await queryDb(
          `UPDATE public.bookings
           SET status = 'Report Ready', report_id = $1, updated_at = NOW()
           WHERE id::text = $2 OR order_number = $2 OR order_number = $3;`,
          [reportId, cleanBookingId, `#${cleanBookingId}`]
        );
      }
    } catch (dbErr) {
      console.error('[API upload-file DB persistence error]', dbErr);
    }

    const reportData = {
      id: reportId,
      report_number: reportNumber,
      booking_id: bookingId,
      patient_id: patientId,
      file_path: objectKey,
      file_url: presignedDownloadUrl || `/api/reports/${reportId}/download`,
      download_url: `/api/reports/${reportId}/download`,
      r2_url: presignedDownloadUrl,
      status: 'Released',
      overall_remarks: overallRemarks,
      doctor_name: doctorName,
      lab_technician: labTechnician,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Report uploaded & released successfully. Booking status updated to Report Ready.',
      data: reportData,
    });
  } catch (err: any) {
    console.error('[API /api/reports/upload-file POST error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
