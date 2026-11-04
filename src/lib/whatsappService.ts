/**
 * Wellness Diagnostic Center - WhatsApp Notification Service
 * Sends automated WhatsApp alerts to Admin (+91 96112 13216)
 * Supports CallMeBot (Free), Twilio WhatsApp, Meta Cloud API, or Custom Webhook.
 */

export interface OrderWhatsAppPayload {
  orderId: string;
  reference: string;
  patientName: string;
  phone: string;
  totalAmount: number;
  testName: string;
  timeSlot: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export const ADMIN_PHONE_NUMBER = '919611213216';

/**
 * Formats a clean, professional WhatsApp message for lab staff & phlebotomy dispatch
 */
export function formatOrderWhatsAppMessage(order: OrderWhatsAppPayload): string {
  const mapLink =
    order.latitude && order.longitude
      ? `\n🗺️ *GPS Location:* https://www.google.com/maps?q=${order.latitude},${order.longitude}`
      : '';

  return (
    `🔔 *WELLNESS DIAGNOSTIC - NEW ORDER ALERT* 🔔\n\n` +
    `📋 *Order ID:* #${order.reference || order.orderId}\n` +
    `👤 *Patient:* ${order.patientName || 'New Patient'}\n` +
    `📞 *Contact:* ${order.phone || 'N/A'}\n` +
    `🧪 *Diagnostic Test:* ${order.testName || 'Health Package'}\n` +
    `💰 *Total Amount:* ₹${order.totalAmount || 0}\n` +
    `⏰ *Collection Slot:* ${order.timeSlot || 'Scheduled Home Collection'}\n` +
    (order.address ? `📍 *Address:* ${order.address}\n` : '') +
    mapLink +
    `\n\n👉 *Manage Order:* https://www.wellnessdiagnosticcenter.in/admin/orders`
  );
}

/**
 * Generates direct WhatsApp click-to-chat deep link
 */
export function getWhatsAppDirectUrl(order: OrderWhatsAppPayload, targetPhone = ADMIN_PHONE_NUMBER): string {
  const text = encodeURIComponent(formatOrderWhatsAppMessage(order));
  const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${text}`;
}

/**
 * Dispatch automated WhatsApp message via available API provider
 */
export async function sendWhatsAppNotification(order: OrderWhatsAppPayload): Promise<{ success: boolean; message: string }> {
  const text = formatOrderWhatsAppMessage(order);
  const phone = process.env.ADMIN_WHATSAPP_PHONE || ADMIN_PHONE_NUMBER;
  const apiKey = process.env.WHATSAPP_API_KEY || process.env.CALLMEBOT_API_KEY;

  // 1. If CallMeBot API key is configured
  if (apiKey) {
    try {
      const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) {
        return { success: true, message: 'WhatsApp alert dispatched via CallMeBot' };
      }
    } catch (err: any) {
      console.warn('[WhatsApp] CallMeBot error:', err.message);
    }
  }

  // 2. If Twilio WhatsApp credentials are configured
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_WHATSAPP_FROM; // e.g. whatsapp:+14155238886

  if (twilioSid && twilioAuth && twilioFrom) {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');
      const body = new URLSearchParams({
        From: twilioFrom.startsWith('whatsapp:') ? twilioFrom : `whatsapp:${twilioFrom}`,
        To: `whatsapp:+${phone.replace(/[^0-9]/g, '')}`,
        Body: text,
      });

      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (res.ok) {
        return { success: true, message: 'WhatsApp alert dispatched via Twilio' };
      }
    } catch (err: any) {
      console.warn('[WhatsApp] Twilio error:', err.message);
    }
  }

  // 3. If Green-API (Free Developer Instance) is configured
  const greenId = process.env.GREEN_API_ID_INSTANCE;
  const greenToken = process.env.GREEN_API_TOKEN_INSTANCE;

  if (greenId && greenToken) {
    try {
      const cleanTarget = phone.replace(/[^0-9]/g, '');
      const chatId = cleanTarget.endsWith('@c.us') ? cleanTarget : `${cleanTarget}@c.us`;
      const url = `https://api.green-api.com/waInstance${greenId}/sendMessage/${greenToken}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
          message: text,
        }),
      });

      if (res.ok) {
        return { success: true, message: 'WhatsApp alert dispatched via Green-API' };
      }
    } catch (err: any) {
      console.warn('[WhatsApp] Green-API error:', err.message);
    }
  }

  // 4. If Meta Cloud API is configured
  const metaToken = process.env.META_WHATSAPP_TOKEN;
  const metaPhoneId = process.env.META_PHONE_NUMBER_ID;

  if (metaToken && metaPhoneId) {
    try {
      const res = await fetch(`https://graph.facebook.com/v20.0/${metaPhoneId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${metaToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone.replace(/[^0-9]/g, ''),
          type: 'text',
          text: { body: text },
        }),
      });

      if (res.ok) {
        return { success: true, message: 'WhatsApp alert dispatched via Meta Cloud API' };
      }
    } catch (err: any) {
      console.warn('[WhatsApp] Meta error:', err.message);
    }
  }

  return {
    success: false,
    message: 'WhatsApp automated API requires an API key (CallMeBot, Twilio, or Meta Cloud API)',
  };
}

