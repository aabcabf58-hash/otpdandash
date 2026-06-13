import { AppError } from './AppError.js';

export function normalizePhone(value) {
  const phone = value.replace(/[\s()-]/g, '');
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    throw new AppError(
      400,
      'Phone must use international E.164 format, for example +96170123456.',
      'INVALID_PHONE',
    );
  }
  return phone;
}
