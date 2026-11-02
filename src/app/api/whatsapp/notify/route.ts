import { NextRequest, NextResponse } from 'next/server';
import { 
  sendWhatsAppNotification, 
  getWhatsAppDirectUrl, 
  ADMIN_PHONE_NUMBER 
} from '@/lib/whatsappService';

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
      address,
      latitude,
      longitude,
    } = body;

    const payload = {
      orderId: orderId || 'NEW',
      reference: reference || 'WD-2026',
      patientName: patientName || 'Patient',
      phone: phone || '',
      totalAmount: totalAmount || 0,
      testName: testName || 'Diagnostic Package',
      timeSlot: timeSlot || 'Scheduled Home Collection',
      address,
      latitude,
      longitude,
    };

    const directUrl = getWhatsAppDirectUrl(payload, ADMIN_PHONE_NUMBER);
    const result = await sendWhatsAppNotification(payload);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      directUrl,
      adminPhone: ADMIN_PHONE_NUMBER,
    });
  } catch (err: any) {
    console.error('[WhatsApp API] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

