/**
 * POST /api/otp/verify-change-password
 * Verifies OTP then changes the patient's password.
 * This is the atomic "verify OTP + change password" endpoint.
 *
 * Body: {
 *   phone:            string  — patient's registered phone
 *   otp:              string  — 6-digit OTP entered by user
 *   user_id:          string  — from session (AuthContext)
 *   email:            string  — from session
 *   current_password: string
 *   new_password:     string
 * }
 *
 * Returns: { success: boolean, error?: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP, cleanupExpiredOTPs } from '@/lib/otpService';
import { sanitizePhone } from '@/lib/security/sanitize';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const phone = sanitizePhone(body.phone || '');
    const otp = String(body.otp || '').trim();
    const userId = String(body.user_id || '').trim();
    const email = String(body.email || '').trim();
    const currentPassword = body.current_password;
    const newPassword = body.new_password;

    // ── Input validation ───────────────────────────────────────────────────
    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, error: 'Phone and OTP are required.' },
        { status: 400 }
      );
    }

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    if (!userId && !email) {
      return NextResponse.json(
        { success: false, error: 'User identity (user_id or email) is required.' },
        { status: 400 }
      );
    }

    // ── Step 1: Verify OTP ─────────────────────────────────────────────────
    const otpResult = await verifyOTP(phone, otp, 'change_password');

    if (!otpResult.valid) {
      return NextResponse.json(
        { success: false, error: otpResult.error },
        { status: 400 }
      );
    }

    // ── Step 2: Change password via backend ────────────────────────────────
    const backendRes = await fetch(`${BACKEND_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId || undefined,
        email: email || undefined,
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    const backendData = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          success: false,
          error: backendData.detail || 'Failed to update password. Please check your current password.',
        },
        { status: backendRes.status }
      );
    }

    // ── Cleanup old OTPs (non-blocking) ────────────────────────────────────
    cleanupExpiredOTPs().catch(() => {});

    return NextResponse.json({ success: true, message: 'Password changed successfully.' });
  } catch (err: any) {
    console.error('[POST /api/otp/verify-change-password]', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}

