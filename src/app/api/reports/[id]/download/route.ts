import { NextRequest, NextResponse } from 'next/server';
import { queryDb } from '@/lib/server/db';
import { getPresignedDownloadUrl } from '@/lib/server/r2';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = decodeURIComponent(id).trim();

    const sql = `
      SELECT id, report_number, file_path
      FROM public.reports
      WHERE id::text = $1 OR report_number = $1 OR booking_id::text = $1
      LIMIT 1;
    `;

    const rows = await queryDb(sql, [cleanId]);
    if (rows.length === 0 || !rows[0].file_path) {
      return NextResponse.json({ error: 'Report PDF document not found' }, { status: 404 });
    }

    const report = rows[0];
    const filename = `${report.report_number || 'lab_report'}.pdf`;

    const downloadUrl = await getPresignedDownloadUrl(report.file_path, 3600, filename);
    if (!downloadUrl) {
      return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 });
    }

    // Direct redirect to Cloudflare R2 presigned attachment download URL
    return NextResponse.redirect(downloadUrl, 302);
  } catch (err: any) {
    console.error('[API /api/reports/[id]/download error]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
