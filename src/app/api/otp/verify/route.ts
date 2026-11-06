/**
 * POST /api/otp/verify
 * Verifies an OTP. Used before account creation (register flow).
 * Does NOT create the account — just confirms OTP is valid.
 *
 * Body: { phone: string, otp: string, purpose: 'register' | 'change_password' }
 * Returns: { valid: boolean, error?: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP, cleanupExpiredOTPs, OtpPurpose } from '@/lib/otpService';
import { sanitizePhone } from '@/lib/security/sanitize';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phone = sanitizePhone(body.phone || '');
    const otp = String(body.otp || '').trim();
    const purpose = body.purpose as OtpPurpose;

    if (!phone || !otp || !purpose) {
      return NextResponse.json(
        { valid: false, error: 'phone, otp, and purpose are all required.' },
        { status: 400 }
      );
    }

    if (!['register', 'change_password'].includes(purpose)) {
      return NextResponse.json(
        { valid: false, error: 'Invalid purpose.' },
        { status: 400 }
      );
    }

    const result = await verifyOTP(phone, otp, purpose);

    // Non-blocking cleanup of old tokens
    cleanupExpiredOTPs().catch(() => {});

    if (!result.valid) {
      return NextResponse.json({ valid: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ valid: true });
  } catch (err: any) {
    console.error('[POST /api/otp/verify]', err);
    return NextResponse.json({ valid: false, error: 'Internal server error.' }, { status: 500 });
  }
}

