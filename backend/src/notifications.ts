interface BookingNotification {
  id: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  brand: string;
  model: string;
  problemTitle: string;
  status: string;
  scheduledDate?: string;
  scheduledTimeSlot: string;
  address: string;
  city: string;
  area: string;
  warrantyValidUntil?: string;
}

const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.NOTIFICATION_EMAIL_FROM;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;

function logSkipped(channel: string, reason: string): void {
  console.info(`[notifications] ${channel} skipped: ${reason}`);
}

function toE164(phone: string): string | null {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return null;
  if (trimmed.startsWith('+')) return `+${digits}`;
  if (digits.startsWith('61')) return `+${digits}`;
  if (digits.startsWith('0')) return `+61${digits.slice(1)}`;
  return `+${digits}`;
}

async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  if (!RESEND_API_KEY || !EMAIL_FROM) {
    logSkipped('email', 'RESEND_API_KEY or NOTIFICATION_EMAIL_FROM is not configured');
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: EMAIL_FROM, to, subject, text }),
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend returned ${response.status}: ${body.slice(0, 300)}`);
  }
}

async function sendSms(to: string, body: string): Promise<void> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    logSkipped('sms', 'Twilio credentials are not configured');
    return;
  }

  const destination = toE164(to);
  if (!destination) {
    logSkipped('sms', 'customer phone number is missing or invalid');
    return;
  }

  const credentials = Buffer.from(
    `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`
  ).toString('base64');
  const payload = new URLSearchParams({
    To: destination,
    From: TWILIO_FROM_NUMBER,
    Body: body,
  });

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload.toString(),
      signal: AbortSignal.timeout(8000),
    }
  );

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(`Twilio returned ${response.status}: ${responseBody.slice(0, 300)}`);
  }
}

async function dispatch(
  booking: BookingNotification,
  subject: string,
  message: string
): Promise<void> {
  const results = await Promise.allSettled([
    sendEmail(booking.customerEmail, subject, message),
    sendSms(booking.customerPhone, message),
  ]);

  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('[notifications] delivery failed:', result.reason);
    }
  }
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Booking confirmed',
  technician_assigned: 'Technician assigned',
  technician_en_route: 'Technician on the way',
  technician_arrived: 'Technician arrived',
  in_progress: 'Repair in progress',
  completed: 'Repair completed',
  cancelled: 'Booking cancelled',
};

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${encodeURIComponent(token)}`;
  const message = [
    `Hi ${name},`,
    '',
    'We received a request to reset your Moon Mobile Repair password.',
    `Reset it here: ${resetUrl}`,
    '',
    'This link expires in 30 minutes. If you did not request this, you can ignore this email.',
  ].join('\n');

  if ((!RESEND_API_KEY || !EMAIL_FROM) && process.env.NODE_ENV !== 'production') {
    console.info(`[notifications] password reset link for ${email}: ${resetUrl}`);
    return;
  }

  await sendEmail(email, 'Reset your Moon Mobile Repair password', message);
}

export async function notifyBookingCreated(booking: BookingNotification): Promise<void> {
  const subject = `Booking confirmed: ${booking.reference}`;
  const message = [
    `Hi ${booking.customerName},`,
    '',
    `Your ${booking.brand} ${booking.model} ${booking.problemTitle} booking is confirmed.`,
    `Reference: ${booking.reference}`,
    `When: ${booking.scheduledDate || 'To be confirmed'}, ${booking.scheduledTimeSlot}`,
    `Where: ${booking.address}, ${booking.area}, ${booking.city}`,
    '',
    `Track your repair: ${APP_URL}/track`,
  ].join('\n');

  await dispatch(booking, subject, message);
}

export async function notifyBookingStatusChanged(booking: BookingNotification): Promise<void> {
  const label = STATUS_LABELS[booking.status] || 'Booking updated';
  const subject = `${label}: ${booking.reference}`;
  const message = [
    `Hi ${booking.customerName},`,
    '',
    `${label} for ${booking.reference}.`,
    `${booking.brand} ${booking.model} - ${booking.problemTitle}`,
    booking.warrantyValidUntil
      ? `Warranty valid until: ${booking.warrantyValidUntil}`
      : undefined,
    '',
    `View live status: ${APP_URL}/track`,
  ]
    .filter(Boolean)
    .join('\n');

  await dispatch(booking, subject, message);
}
