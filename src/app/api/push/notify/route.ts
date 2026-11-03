import { NextRequest, NextResponse } from 'next/server';
import { webPush } from '@/lib/webPush';
import { getServerSupabase } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      orderId, 
      reference, 
      patientName, 
      phone, 
      totalAmount, 
      testName, 
      timeSlot,
      targetUrl = '/admin/orders'
    } = body;

    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database client unavailable' }, { status: 500 });
    }

    // Fetch all active admin/driver push subscriptions
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (error || !subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No registered push subscriptions found',
        sentCount: 0 
      });
    }

    const cleanRef = reference || orderId || 'NEW';
    const payload = JSON.stringify({
      title: `🔔 New Order Placed: #${cleanRef}`,
      body: `Patient: ${patientName || 'New Patient'} • ₹${totalAmount || 0} • ${testName || 'Diagnostic Package'}\nSlot: ${timeSlot || 'Scheduled Home Collection'}`,
      icon: '/logo-192.png',
      badge: '/logo-48.png',
      tag: `wellness-order-${cleanRef}`,
      renotify: true,
      requireInteraction: true,
      vibrate: [300, 100, 300, 100, 300],
      url: targetUrl,
      data: {
        url: targetUrl,
        reference: cleanRef,
        patientName,
        totalAmount,
      }
    });

    let sentCount = 0;
    const staleEndpoints: string[] = [];

    const sendPromises = subscriptions.map(async (sub) => {
      const pushConfig = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webPush.sendNotification(pushConfig, payload, {
          TTL: 60 * 60 * 24, // 24 hours retention on push service
          urgency: 'high',
        });
        sentCount++;
      } catch (err: any) {
        // 404 or 410 means the user uninstalled or revoked permissions
        if (err.statusCode === 404 || err.statusCode === 410) {
          staleEndpoints.push(sub.endpoint);
        } else {
          console.warn('[WebPush] Error sending to endpoint:', err.message);
        }
      }
    });

    await Promise.all(sendPromises);

    // Clean up stale endpoints
    if (staleEndpoints.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', staleEndpoints);
    }

    return NextResponse.json({
      success: true,
      message: `Push notifications dispatched to ${sentCount} device(s)`,
      sentCount,
    });
  } catch (err: any) {
    console.error('[WebPush Dispatch] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

