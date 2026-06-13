import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { normalizePhone } from '../utils/phone.js';
import { consumeOtp, createAndSendOtp } from './otp.service.js';
import { createAccessToken } from './token.service.js';

export async function register({ phone: rawPhone, password }) {
  const phone = normalizePhone(rawPhone);
  if (await User.exists({ phone })) {
    throw new AppError(409, 'An account with this phone already exists.', 'PHONE_EXISTS');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ phone, passwordHash });

  try {
    const otp = await createAndSendOtp(user, 'register');
    return { ...otp, phone: user.phone };
  } catch (error) {
    await User.findByIdAndDelete(user._id);
    throw error;
  }
}

export async function login({ phone: rawPhone, password }) {
  const phone = normalizePhone(rawPhone);
  const user = await User.findOne({ phone }).select('+passwordHash');
  const valid = user && (await bcrypt.compare(password, user.passwordHash));

  if (!valid) {
    throw new AppError(401, 'Invalid phone or password.', 'INVALID_CREDENTIALS');
  }

  const otp = await createAndSendOtp(user, 'login');
  return { ...otp, phone: user.phone };
}

export async function verifyOtp({ challengeId, code }) {
  const challenge = await consumeOtp(challengeId, code);
  const user = await User.findById(challenge.user);

  if (!user) {
    throw new AppError(404, 'User no longer exists.', 'USER_NOT_FOUND');
  }

  user.phoneVerified = true;
  user.lastLoginAt = new Date();
  await user.save();

  return {
    accessToken: createAccessToken(user._id.toString()),
    user: user.toPublicJSON(),
  };
}
