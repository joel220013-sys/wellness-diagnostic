/**
 * POST /api/otp/send
 * Generates and sends an OTP via Fast2SMS Smart OTP.
 *
 * Body: { phone: string, purpose: 'register' | 'change_password' }
 * Returns: { success: boolean, error?: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateAndSendOTP, OtpPurpose } from '@/lib/otpService';
import { sanitizePhone } from '@/lib/security/sanitize';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phone = sanitizePhone(body.phone || '');
    const purpose = body.purpose as OtpPurpose;

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone number is required.' }, { status: 400 });
    }

    if (!['register', 'change_password'].includes(purpose)) {
      return NextResponse.json({ success: false, error: 'Invalid purpose. Must be register or change_password.' }, { status: 400 });
    }

    const result = await generateAndSendOTP(phone, purpose);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 429 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully.' });
  } catch (err: any) {
    console.error('[POST /api/otp/send]', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}

