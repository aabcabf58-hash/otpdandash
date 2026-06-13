import * as authService from '../services/auth.service.js';

export async function register(req, res) {
  const data = await authService.register(req.body);
  res.status(201).json({ success: true, message: 'OTP sent on WhatsApp.', data });
}

export async function login(req, res) {
  const data = await authService.login(req.body);
  res.json({ success: true, message: 'OTP sent on WhatsApp.', data });
}

export async function verifyOtp(req, res) {
  const data = await authService.verifyOtp(req.body);
  res.json({ success: true, message: 'Authentication successful.', data });
}

export async function me(req, res) {
  res.json({ success: true, data: { user: req.user.toPublicJSON() } });
}
