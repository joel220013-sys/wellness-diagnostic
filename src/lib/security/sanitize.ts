/**
 * Security & Input Sanitization Utilities
 * Defends against XSS (Cross-Site Scripting), HTML injection, and malicious scripts.
 */

export function sanitizeInput(input: string | undefined | null): string {
  if (!input) return '';
  return String(input)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove <script> tags
    .replace(/javascript:/gi, '') // Strip inline javascript: pseudo-protocol
    .replace(/on\w+\s*=/gi, '') // Strip inline event handlers like onclick=
    .replace(/<[^>]+>/g, '') // Strip remaining HTML tags
    .trim();
}

export function sanitizeEmail(email: string | undefined | null): string {
  if (!email) return '';
  return sanitizeInput(email).toLowerCase();
}

export function sanitizePhone(phone: string | undefined | null): string {
  if (!phone) return '';
  return sanitizeInput(phone).replace(/[^\d+\-\s()]/g, '');
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const result: any = Array.isArray(obj) ? [] : {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeInput(value);
    } else if (value && typeof value === 'object') {
      result[key] = sanitizeObject(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

