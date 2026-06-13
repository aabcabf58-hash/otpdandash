import twilio from 'twilio';
import { env } from '../config/env.js';

let client;

function getTwilioClient() {
  client ??= twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  return client;
}

async function sendWithGreenApi(phone, message) {
  const chatId = `${phone.replace(/\D/g, '')}@c.us`;
  const url = `${env.GREEN_API_URL}/waInstance${env.GREEN_API_INSTANCE}/sendMessage/${env.GREEN_API_TOKEN}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Green API rejected WhatsApp message (${response.status}): ${details}`);
  }
}

export async function sendOtpWhatsApp(phone, code) {
  const message = `Your verification code is ${code}. It expires in ${env.OTP_EXPIRES_MINUTES} minutes.`;

  if (env.WHATSAPP_PROVIDER === 'console') {
    console.log(`[DEV WhatsApp] ${phone}: ${message}`);
    return;
  }

  if (env.WHATSAPP_PROVIDER === 'green-api') {
    await sendWithGreenApi(phone, message);
    return;
  }

  await getTwilioClient().messages.create({
    from: env.TWILIO_WHATSAPP_FROM,
    to: `whatsapp:${phone}`,
    body: message,
  });
}
