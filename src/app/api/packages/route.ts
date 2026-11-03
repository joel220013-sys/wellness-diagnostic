import { NextRequest, NextResponse } from 'next/server';
import { queryDb } from '@/lib/server/db';

function formatPackageRecord(r: any) {
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
    const sql = `
      SELECT * FROM public.tests 
      WHERE is_active = true 
        AND (id LIKE 'pkg_%' OR category ILIKE '%package%' OR category ILIKE '%checkup%' OR category ILIKE '%full body%')
        AND category NOT IN ('Diabetes', 'Hematology')
      ORDER BY is_popular DESC, price ASC;
    `;

    const rows = await queryDb(sql);
    const packages = rows.map(formatPackageRecord);

    return NextResponse.json({
      success: true,
      count: packages.length,
      data: packages,
    });
  } catch (err: any) {
    console.error('[API /api/packages GET error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
