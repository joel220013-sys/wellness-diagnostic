import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/server/db';

export async function GET() {
  try {
    const rows = await queryDb(
      `SELECT id, email, phone, name, role, badge_id, designation, created_at, updated_at
       FROM public.profiles
       ORDER BY created_at ASC;`
    );

    return NextResponse.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (err: any) {
    console.error('[API /api/auth/users GET error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

