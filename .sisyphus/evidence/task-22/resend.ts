import { Resend } from 'resend';

/**
 * Resend email client initialization.
 * Returns null when RESEND_API_KEY is not configured (degraded mode).
 */
export function createResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

/**
 * Check if Resend is configured and available.
 */
export function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY && !!process.env.RESEND_FROM_EMAIL;
}
