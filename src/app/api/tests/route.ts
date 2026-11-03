import { NextRequest, NextResponse } from 'next/server';
import { queryDb } from '@/lib/server/db';

function formatTestRecord(r: any) {
  const price = Number(r.price) || 0;
  const originalPrice = Number(r.original_price) || price;

  let paramsList = r.parameters_list;
  if (typeof paramsList === 'string') {
    try {
      paramsList = JSON.parse(paramsList);
    } catch {
      paramsList = [];
    }
  }

  return {
    ...r,
    price,
    original_price: originalPrice,
    popular: Boolean(r.is_popular),
    active: Boolean(r.is_active ?? true),
    slug: r.id,
    turnaround_description: r.tat || 'Same Day (8-12 Hours)',
    parameters_count: Number(r.parameters_count) || 1,
    parameters_list: paramsList,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const all = searchParams.get('all') === 'true';

    const sql = all
      ? 'SELECT * FROM public.tests ORDER BY name ASC;'
      : 'SELECT * FROM public.tests WHERE is_active = true ORDER BY name ASC;';

    const rows = await queryDb(sql);
    let tests = rows.map(formatTestRecord);

    if (category && category.toUpperCase() !== 'ALL') {
      tests = tests.filter((t) => String(t.category || '').toLowerCase() === category.toLowerCase());
    }

    if (search && search.trim()) {
      const s = search.toLowerCase().trim();
      tests = tests.filter((t) =>
        String(t.name || '').toLowerCase().includes(s) ||
        String(t.description || '').toLowerCase().includes(s)
      );
    }

    return NextResponse.json({
      success: true,
      count: tests.length,
      source: 'supabase',
      data: tests,
    });
  } catch (err: any) {
    console.error('[API /api/tests GET error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
