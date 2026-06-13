import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { OtpChallenge } from '../models/OtpChallenge.js';
import { AppError } from '../utils/AppError.js';
import { sendOtpWhatsApp } from './whatsapp.service.js';

function hashCode(challengeId, code) {
  return crypto
    .createHmac('sha256', env.OTP_SECRET)
    .update(`${challengeId}:${code}`)
    .digest('hex');
}

export async function createAndSendOtp(user, purpose) {
  const recent = await OtpChallenge.findOne({
    user: user._id,
    purpose,
    consumedAt: null,
    createdAt: { $gt: new Date(Date.now() - env.OTP_RESEND_COOLDOWN_SECONDS * 1000) },
  }).sort({ createdAt: -1 });

  if (recent) {
    throw new AppError(429, 'Please wait before requesting another code.', 'OTP_COOLDOWN');
  }

  await OtpChallenge.updateMany(
    { user: user._id, purpose, consumedAt: null },
    { consumedAt: new Date() },
  );

  const code = crypto.randomInt(100000, 1000000).toString();
  const challenge = new OtpChallenge({
    user: user._id,
    purpose,
    codeHash: 'pending',
    expiresAt: new Date(Date.now() + env.OTP_EXPIRES_MINUTES * 60_000),
    attemptsRemaining: env.OTP_MAX_ATTEMPTS,
  });
  challenge.codeHash = hashCode(challenge._id.toString(), code);
  await challenge.save();

  try {
    await sendOtpWhatsApp(user.phone, code);
  } catch (error) {
    await OtpChallenge.findByIdAndDelete(challenge._id);
    throw error;
  }

  return {
    challengeId: challenge._id.toString(),
    expiresInSeconds: env.OTP_EXPIRES_MINUTES * 60,
  };
}

export async function consumeOtp(challengeId, code) {
  const challenge = await OtpChallenge.findById(challengeId).select('+codeHash');

  if (!challenge || challenge.consumedAt) {
    throw new AppError(400, 'OTP challenge is invalid or already used.', 'INVALID_CHALLENGE');
  }
  if (challenge.expiresAt <= new Date()) {
    throw new AppError(400, 'OTP code has expired.', 'OTP_EXPIRED');
  }
  if (challenge.attemptsRemaining <= 0) {
    throw new AppError(429, 'Too many incorrect attempts.', 'OTP_ATTEMPTS_EXCEEDED');
  }

  const suppliedHash = hashCode(challenge._id.toString(), code);
  const matches = crypto.timingSafeEqual(
    Buffer.from(challenge.codeHash, 'hex'),
    Buffer.from(suppliedHash, 'hex'),
  );

  if (!matches) {
    challenge.attemptsRemaining -= 1;
    await challenge.save();
    throw new AppError(400, 'OTP code is incorrect.', 'INVALID_OTP');
  }

  challenge.consumedAt = new Date();
  await challenge.save();
  return challenge;
}
