import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscription, userId, userRole, userAgent } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return NextResponse.json({ success: false, error: 'Invalid PushSubscription payload' }, { status: 400 });
    }

    const supabase = getServerSupabase();
    if (supabase) {
      // Upsert by endpoint
      const { error } = await supabase.from('push_subscriptions').upsert(
        {
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          user_id: userId || 'admin',
          user_role: userRole || 'admin',
          user_agent: userAgent || 'Browser',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' }
      );

      if (error) {
        console.error('[Push Subscribe] Supabase error:', error);
      }
    }

    return NextResponse.json({ success: true, message: 'Push subscription registered successfully' });
  } catch (err: any) {
    console.error('[Push Subscribe] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
