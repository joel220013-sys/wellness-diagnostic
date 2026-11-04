import { NextRequest, NextResponse } from 'next/server';
import { queryDb } from '@/lib/server/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = decodeURIComponent(id).trim();
    const body = await req.json();

    const updates: string[] = ['updated_at = NOW()'];
    const values: any[] = [];
    let idx = 1;

    if (body.name !== undefined) {
      updates.push(`name = $${idx++}`);
      values.push(body.name);
    }
    if (body.phone !== undefined) {
      updates.push(`phone = $${idx++}`);
      values.push(body.phone);
    }
    if (body.badge_id !== undefined) {
      updates.push(`badge_id = $${idx++}`);
      values.push(body.badge_id);
    }
    if (body.designation !== undefined) {
      updates.push(`designation = $${idx++}`);
      values.push(body.designation);
    }

    values.push(cleanId);
    const sql = `
      UPDATE public.profiles
      SET ${updates.join(', ')}
      WHERE id::text = $${idx}
      RETURNING *;
    `;

    const rows = await queryDb(sql, values);
    return NextResponse.json({
      success: true,
      message: 'Driver updated successfully',
      data: rows[0] || { id: cleanId, ...body },
    });
  } catch (err: any) {
    console.error('[API /api/admin/drivers/[id] PATCH error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = decodeURIComponent(id).trim();

    await queryDb(`DELETE FROM public.profiles WHERE id::text = $1;`, [cleanId]);

    return NextResponse.json({
      success: true,
      message: 'Driver deleted successfully',
      id: cleanId,
    });
  } catch (err: any) {
    console.error('[API /api/admin/drivers/[id] DELETE error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

