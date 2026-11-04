import { NextRequest, NextResponse } from 'next/server';
import { sendSMS, LAB_ADMIN_PHONE } from '@/lib/smsService';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get('phone') || LAB_ADMIN_PHONE;
  const msg = searchParams.get('msg') || 'Wellness Diagnostic Center: Real SMS testing successful!';

  const result = await sendSMS({
    to: phone,
    message: msg,
    tag: 'MANUAL_TEST',
  });

  return NextResponse.json({
    success: result.success,
    provider: result.provider,
    targetPhone: phone,
    message: msg,
    details: result,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phone = body.phone || LAB_ADMIN_PHONE;
    const msg = body.message || 'Wellness Diagnostic Center: Real SMS alert test.';

    const result = await sendSMS({
      to: phone,
      message: msg,
      tag: body.tag || 'MANUAL_TEST',
    });

    return NextResponse.json({
      success: result.success,
      provider: result.provider,
      targetPhone: phone,
      details: result,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

