import { NextRequest, NextResponse } from 'next/server';
import { queryDb } from '@/lib/server/db';
import crypto from 'crypto';

export async function GET() {
  try {
    const query = `
      SELECT 
        p.id, 
        p.name, 
        p.phone, 
        p.email, 
        p.badge_id, 
        p.designation, 
        p.created_at,
        COALESCE(b.active_count, 0) as assigned_orders_count
      FROM public.profiles p
      LEFT JOIN (
        SELECT assigned_driver_id::text as driver_id, COUNT(*) as active_count
        FROM public.bookings
        WHERE status IN ('Assigned', 'Collection Scheduled', 'Sample Collected')
        GROUP BY assigned_driver_id::text
      ) b ON b.driver_id = p.id::text
      WHERE p.role::text = 'driver'
      ORDER BY p.name ASC;
    `;

    let rows = await queryDb(query);

    // Auto-seed default staff if empty
    if (!rows || rows.length === 0) {
      const defaultStaff = [
        ['e4a2c1f0-7b3d-4c8e-9f1a-2b3c4d5e6f01', 'Rajesh Kumar', '+91 98111 22334', 'rajesh.phleb@wellness.com', 'WD-PHLEB-DEL-01', 'Senior Phlebotomist & Cold-Chain Lead'],
        ['e4a2c1f0-7b3d-4c8e-9f1a-2b3c4d5e6f02', 'Pooja Sharma', '+91 98222 33445', 'pooja.phleb@wellness.com', 'WD-PHLEB-DEL-02', 'Certified Pediatric Phlebotomist'],
        ['e4a2c1f0-7b3d-4c8e-9f1a-2b3c4d5e6f03', 'Amit Patel', '+91 98333 44556', 'amit.phleb@wellness.com', 'WD-PHLEB-DEL-03', 'Emergency Sample Transport Specialist'],
      ];

      for (const [sId, sName, sPhone, sEmail, sBadge, sDesig] of defaultStaff) {
        try {
          await queryDb(
            `INSERT INTO public.profiles (id, email, phone, name, role, badge_id, designation, created_at, updated_at)
             VALUES ($1, $2, $3, $4, 'driver'::user_role, $5, $6, NOW(), NOW())
             ON CONFLICT (id) DO NOTHING;`,
            [sId, sEmail, sPhone, sName, sBadge, sDesig]
          );
        } catch {}
      }

      rows = await queryDb(query);
    }

    const drivers = rows.map((r: any) => {
      const dId = String(r.id);
      return {
        id: dId,
        name: r.name || 'Phlebotomist',
        phone: r.phone || '+91 98765 00000',
        email: r.email || '',
        badge_id: r.badge_id || `WD-PHLEB-${dId.slice(0, 4).toUpperCase()}`,
        assigned_orders_count: Number(r.assigned_orders_count) || 0,
        is_active: true,
        vehicle_details: 'Davangere Cold-Chain Van',
        created_at: r.created_at ? String(r.created_at) : '',
      };
    });

    return NextResponse.json({
      success: true,
      count: drivers.length,
      data: drivers,
    });
  } catch (err: any) {
    console.error('[API /api/admin/drivers GET error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const driverId = crypto.randomUUID();
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const email = String(body.email || `${name.toLowerCase().replace(/\s+/g, '.') || 'driver'}@wellness.com`).trim();
    const badgeId = String(body.badge_id || `WD-PHLEB-${driverId.slice(0, 4).toUpperCase()}`).trim();
    const designation = String(body.designation || 'Certified Phlebotomist').trim();

    await queryDb(
      `INSERT INTO public.profiles (id, email, phone, name, role, badge_id, designation, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'driver'::user_role, $5, $6, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, updated_at = NOW();`,
      [driverId, email, phone, name, badgeId, designation]
    );

    const driverObj = {
      id: driverId,
      name,
      phone,
      email,
      badge_id: badgeId,
      designation,
      assigned_orders_count: 0,
      is_active: true,
      vehicle_details: 'Davangere Cold-Chain Van',
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: `Phlebotomist ${name} registered successfully`,
      data: driverObj,
    });
  } catch (err: any) {
    console.error('[API /api/admin/drivers POST error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

