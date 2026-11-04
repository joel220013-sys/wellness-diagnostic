/**
 * Wellness Diagnostic Center - Real SMS Notification Service
 * Primary Lab Admin Mobile: +91 96112 13216 (919611213216)
 * Supports: Fast2SMS, MSG91, Twilio, or Custom HTTP Gateway
 */

export const LAB_ADMIN_PHONE = process.env.LAB_ADMIN_PHONE || '919611213216';

export interface SendSMSOptions {
  to: string; // Recipient mobile number (10-digit or with +91)
  message: string;
  templateId?: string; // Optional TRAI DLT template ID
  tag?: string; // e.g. 'BOOKING_CONFIRMATION', 'REPORT_READY'
}

export interface SMSResult {
  success: boolean;
  provider: string;
  messageId?: string;
  error?: string;
}

/**
 * Normalizes phone numbers to standard 10-digit Indian mobile format or with country code
 */
export function normalizeIndianPhone(phone: string): { clean10: string; with91: string } {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    return { clean10: digits, with91: `91${digits}` };
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return { clean10: digits.slice(2), with91: digits };
  }
  if (digits.length > 10) {
    const last10 = digits.slice(-10);
    return { clean10: last10, with91: `91${last10}` };
  }
  return { clean10: digits, with91: digits };
}

/**
 * Generic SMS sender that checks configured environment variables
 */
export async function sendSMS({ to, message, templateId, tag }: SendSMSOptions): Promise<SMSResult> {
  const { clean10, with91 } = normalizeIndianPhone(to);
  if (!clean10 || clean10.length !== 10) {
    console.warn(`[SMS Service] Invalid mobile number: "${to}"`);
    return { success: false, provider: 'none', error: 'Invalid 10-digit mobile number' };
  }

  // 1. Check Fast2SMS
  const fast2SmsKey = process.env.FAST2SMS_API_KEY;
  if (fast2SmsKey) {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: fast2SmsKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: templateId ? 'dlt' : 'q',
          message,
          language: 'english',
          flash: 0,
          numbers: clean10,
          ...(templateId ? { template_id: templateId } : {}),
        }),
      });

      const resData = await response.json();
      if (resData.return) {
        console.log(`[SMS Fast2SMS Success] Sent to ${clean10} [${tag || 'SMS'}]`);
        return { success: true, provider: 'fast2sms', messageId: resData.request_id };
      }
      console.warn('[SMS Fast2SMS API response]', resData);
    } catch (err: any) {
      console.error('[SMS Fast2SMS error]', err);
    }
  }

  // 2. Check MSG91
  const msg91AuthKey = process.env.MSG91_AUTH_KEY;
  const msg91SenderId = process.env.MSG91_SENDER_ID || 'WLNESS';
  if (msg91AuthKey) {
    try {
      const response = await fetch('https://control.msg91.com/api/v5/flow/', {
        method: 'POST',
        headers: {
          authkey: msg91AuthKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          flow_id: templateId || process.env.MSG91_FLOW_ID,
          sender: msg91SenderId,
          recipients: [{ mobiles: with91, message }],
        }),
      });

      const resData = await response.json();
      if (response.ok && resData.type === 'success') {
        console.log(`[SMS MSG91 Success] Sent to ${with91} [${tag || 'SMS'}]`);
        return { success: true, provider: 'msg91', messageId: resData.message };
      }
    } catch (err: any) {
      console.error('[SMS MSG91 error]', err);
    }
  }

  // 3. Check Twilio
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
  if (twilioSid && twilioAuth && twilioFrom) {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');
      const body = new URLSearchParams({
        From: twilioFrom,
        To: `+${with91}`,
        Body: message,
      });

      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      const resData = await res.json();
      if (res.ok) {
        console.log(`[SMS Twilio Success] Sent to ${with91} [${tag || 'SMS'}]`);
        return { success: true, provider: 'twilio', messageId: resData.sid };
      }
    } catch (err: any) {
      console.error('[SMS Twilio error]', err);
    }
  }

  // Fallback / Development Simulation mode
  console.log(`\n======================================================`);
  console.log(`[REAL SMS SIMULATION - Awaiting Gateway API Key]`);
  console.log(`TO: +${with91}`);
  console.log(`TAG: ${tag || 'GENERAL_SMS'}`);
  console.log(`MESSAGE:\n"${message}"`);
  console.log(`======================================================\n`);

  return {
    success: true,
    provider: 'simulation',
    messageId: `sim_${Date.now()}`,
  };
}

/**
 * 1. Booking Confirmation SMS (To Patient)
 */
export async function sendBookingPatientSMS(booking: {
  bookingReference: string;
  patientName: string;
  patientPhone: string;
  scheduledSlot: string;
  totalAmount: number;
}) {
  const message = `Dear ${booking.patientName}, your home collection booking #${booking.bookingReference} for ${booking.scheduledSlot} is CONFIRMED with Wellness Diagnostic Center, Davanagere. Doorstep fee: Rs.50. Total: Rs.${booking.totalAmount}. Track: https://wellnessdiagnosticcenter.in`;

  return sendSMS({
    to: booking.patientPhone,
    message,
    tag: 'PATIENT_BOOKING_CONFIRMED',
  });
}

/**
 * 2. New Booking Alert SMS (To Lab Admin +91 96112 13216)
 */
export async function sendBookingAdminSMS(booking: {
  bookingReference: string;
  patientName: string;
  patientPhone: string;
  scheduledSlot: string;
  totalAmount: number;
  locality?: string;
}) {
  const message = `ALERT: New Home Collection Order #${booking.bookingReference}! Patient: ${booking.patientName} (${booking.patientPhone}). Slot: ${booking.scheduledSlot}. Area: ${booking.locality || 'Davanagere'}. Total: Rs.${booking.totalAmount}. Assign driver: https://wellnessdiagnosticcenter.in/admin/orders`;

  return sendSMS({
    to: LAB_ADMIN_PHONE,
    message,
    tag: 'ADMIN_NEW_ORDER_ALERT',
  });
}

/**
 * 3. Phlebotomist Assigned SMS (To Patient)
 */
export async function sendAssignmentPatientSMS(details: {
  patientName: string;
  patientPhone: string;
  bookingReference: string;
  scheduledSlot: string;
  driverName: string;
  driverPhone: string;
}) {
  const message = `Dear ${details.patientName}, Phlebotomist ${details.driverName} (Mob: ${details.driverPhone}) has been assigned for your sample collection today at ${details.scheduledSlot}. Wellness Diagnostic Center, Davanagere.`;

  return sendSMS({
    to: details.patientPhone,
    message,
    tag: 'PATIENT_DRIVER_ASSIGNED',
  });
}

/**
 * 4. Task Assignment SMS (To Driver / Phlebotomist)
 */
export async function sendAssignmentDriverSMS(details: {
  driverName: string;
  driverPhone: string;
  bookingReference: string;
  patientName: string;
  patientPhone: string;
  scheduledSlot: string;
  addressText: string;
  latitude?: number;
  longitude?: number;
}) {
  const mapLink =
    details.latitude && details.longitude
      ? ` GPS: https://maps.google.com/?q=${details.latitude},${details.longitude}`
      : '';

  const message = `New Pickup Task #${details.bookingReference}! Patient: ${details.patientName} (Mob: ${details.patientPhone}). Slot: ${details.scheduledSlot}. Address: ${details.addressText}.${mapLink} Wellness Diagnostic.`;

  return sendSMS({
    to: details.driverPhone,
    message,
    tag: 'DRIVER_TASK_ASSIGNED',
  });
}

/**
 * 5. Report Ready SMS (To Patient)
 */
export async function sendReportReadyPatientSMS(details: {
  patientName: string;
  patientPhone: string;
  bookingReference: string;
}) {
  const message = `Dear ${details.patientName}, your diagnostic lab report for booking #${details.bookingReference} is READY! Download your digital verified PDF report here: https://wellnessdiagnosticcenter.in/patient/reports. Wellness Diagnostic Center, Davanagere.`;

  return sendSMS({
    to: details.patientPhone,
    message,
    tag: 'PATIENT_REPORT_READY',
  });
}

