/**
 * Wellness Diagnostic Center — OTP Service
 * Handles generation, storage (hashed), SMS delivery, and verification
 * of one-time passwords for:
 *   - Patient account creation (purpose: 'register')
 *   - Password change (purpose: 'change_password')
 *
 * Uses: Fast2SMS Smart OTP route | bcryptjs hashing | Supabase/PostgreSQL storage
 */

import bcrypt from 'bcryptjs';
import { queryDb } from '@/lib/server/db';
import { normalizeIndianPhone } from '@/lib/smsService';

export type OtpPurpose = 'register' | 'change_password';

const OTP_EXPIRY_MINUTES = 5;
const OTP_MAX_ATTEMPTS = 3;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const BCRYPT_ROUNDS = 10;

// ─────────────────────────────────────────────────────────────────────────────
// GENERATE & SEND OTP
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates a 6-digit OTP, hashes it, stores in DB, and sends via Fast2SMS Smart OTP.
 * Enforces a 60-second cooldown between sends for the same phone + purpose.
 *
 * Returns: { success, error? }
 */
export async function generateAndSendOTP(
  phone: string,
  purpose: OtpPurpose
): Promise<{ success: boolean; error?: string }> {
  const { clean10 } = normalizeIndianPhone(phone);

  if (!clean10 || clean10.length !== 10) {
    return { success: false, error: 'Invalid phone number. Must be a 10-digit Indian mobile number.' };
  }

  // ── Cooldown Check ────────────────────────────────────────────────────────
  const recentRows = await queryDb<{ created_at: Date }>(
    `SELECT created_at FROM public.otp_tokens
     WHERE phone = $1 AND purpose = $2
       AND created_at > NOW() - INTERVAL '${OTP_RESEND_COOLDOWN_SECONDS} seconds'
     ORDER BY created_at DESC
     LIMIT 1`,
    [clean10, purpose]
  );

  if (recentRows.length > 0) {
    const sentAt = new Date(recentRows[0].created_at).getTime();
    const secondsLeft = OTP_RESEND_COOLDOWN_SECONDS - Math.floor((Date.now() - sentAt) / 1000);
    return {
      success: false,
      error: `Please wait ${secondsLeft} second${secondsLeft !== 1 ? 's' : ''} before requesting a new OTP.`,
    };
  }

  // ── Invalidate any previous unused OTPs for this phone+purpose ───────────
  await queryDb(
    `UPDATE public.otp_tokens SET used = true
     WHERE phone = $1 AND purpose = $2 AND used = false`,
    [clean10, purpose]
  );

  // ── Generate OTP ──────────────────────────────────────────────────────────
  const otpCode = String(Math.floor(100000 + Math.random() * 900000));
  const otpHash = await bcrypt.hash(otpCode, BCRYPT_ROUNDS);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

  // ── Store hashed OTP in DB ────────────────────────────────────────────────
  await queryDb(
    `INSERT INTO public.otp_tokens (phone, otp_hash, purpose, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [clean10, otpHash, purpose, expiresAt]
  );

  // ── Send via Fast2SMS Smart OTP ───────────────────────────────────────────
  const sendResult = await sendOTPViaSMS(clean10, otpCode, purpose);

  if (!sendResult.success) {
    console.error('[OTP] SMS delivery failed for', clean10, sendResult.error);
    // We still return success: true if DB insert worked — in dev/simulation mode
    // the OTP is printed to console and can still be tested
    if (process.env.NODE_ENV === 'production') {
      return { success: false, error: 'Failed to send OTP SMS. Please try again.' };
    }
  }

  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// VERIFY OTP
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verifies an OTP entered by the user.
 * - Checks expiry
 * - Checks max attempts (3)
 * - Marks as used on success
 *
 * Returns: { valid: boolean; error?: string }
 */
export async function verifyOTP(
  phone: string,
  otp: string,
  purpose: OtpPurpose
): Promise<{ valid: boolean; error?: string }> {
  const { clean10 } = normalizeIndianPhone(phone);

  if (!clean10 || clean10.length !== 10) {
    return { valid: false, error: 'Invalid phone number.' };
  }

  if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
    return { valid: false, error: 'OTP must be exactly 6 digits.' };
  }

  // ── Fetch the latest unused, non-expired OTP ──────────────────────────────
  const rows = await queryDb<{
    id: string;
    otp_hash: string;
    attempts: number;
    expires_at: Date;
    used: boolean;
  }>(
    `SELECT id, otp_hash, attempts, expires_at, used
     FROM public.otp_tokens
     WHERE phone = $1 AND purpose = $2 AND used = false
     ORDER BY created_at DESC
     LIMIT 1`,
    [clean10, purpose]
  );

  if (rows.length === 0) {
    return { valid: false, error: 'No OTP found. Please request a new one.' };
  }

  const record = rows[0];

  // ── Check expiry ──────────────────────────────────────────────────────────
  if (new Date(record.expires_at) < new Date()) {
    await queryDb(`UPDATE public.otp_tokens SET used = true WHERE id = $1`, [record.id]);
    return { valid: false, error: 'OTP has expired. Please request a new one.' };
  }

  // ── Check max attempts ────────────────────────────────────────────────────
  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    await queryDb(`UPDATE public.otp_tokens SET used = true WHERE id = $1`, [record.id]);
    return { valid: false, error: 'Too many incorrect attempts. Please request a new OTP.' };
  }

  // ── Verify bcrypt hash ────────────────────────────────────────────────────
  const isMatch = await bcrypt.compare(otp, record.otp_hash);

  if (!isMatch) {
    // Increment failed attempts
    await queryDb(
      `UPDATE public.otp_tokens SET attempts = attempts + 1 WHERE id = $1`,
      [record.id]
    );
    const remaining = OTP_MAX_ATTEMPTS - (record.attempts + 1);
    return {
      valid: false,
      error: remaining > 0
        ? `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
        : 'Too many incorrect attempts. Please request a new OTP.',
    };
  }

  // ── Mark OTP as used ──────────────────────────────────────────────────────
  await queryDb(
    `UPDATE public.otp_tokens SET used = true WHERE id = $1`,
    [record.id]
  );

  return { valid: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// CLEANUP (Optional — called by a cron or manually)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Deletes expired/used OTP tokens older than 1 hour.
 * Safe to call from any API route after a verify attempt.
 */
export async function cleanupExpiredOTPs(): Promise<void> {
  try {
    await queryDb(
      `DELETE FROM public.otp_tokens
       WHERE expires_at < NOW() - INTERVAL '1 hour' OR used = true`,
      []
    );
  } catch {
    // Non-fatal — just log
    console.warn('[OTP] Cleanup failed (non-fatal)');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL: Fast2SMS Smart OTP Delivery
// ─────────────────────────────────────────────────────────────────────────────

async function sendOTPViaSMS(
  phone10: string,
  otp: string,
  purpose: OtpPurpose
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.FAST2SMS_API_KEY;

  const purposeLabel =
    purpose === 'register' ? 'account verification' : 'password change verification';

  if (!apiKey) {
    // Dev simulation — print to console
    console.log('\n╔══════════════════════════════════╗');
    console.log('║      OTP SIMULATION (Dev Mode)   ║');
    console.log('╠══════════════════════════════════╣');
    console.log(`║  TO    : +91 ${phone10}         ║`);
    console.log(`║  OTP   : ${otp}                  ║`);
    console.log(`║  FOR   : ${purposeLabel}`);
    console.log('╚══════════════════════════════════╝\n');
    return { success: true };
  }

  try {
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'otp',
        variables_values: otp,
        numbers: phone10,
        flash: 0,
      }),
    });

    const data = await response.json();

    if (data.return === true) {
      console.log(`[OTP Fast2SMS] Sent to ${phone10} [${purpose}] — request_id: ${data.request_id}`);
      return { success: true };
    }

    console.warn('[OTP Fast2SMS] API rejected:', data);
    return { success: false, error: data.message || 'Fast2SMS rejected the request.' };
  } catch (err: any) {
    console.error('[OTP Fast2SMS] Network error:', err.message);
    return { success: false, error: err.message };
  }
}

