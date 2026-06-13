import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyAccessToken } from '../services/token.service.js';

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.get('authorization');
  if (!header?.startsWith('Bearer ')) {
    throw new AppError(401, 'Authentication token is required.', 'UNAUTHORIZED');
  }

  let payload;
  try {
    payload = verifyAccessToken(header.slice(7));
  } catch {
    throw new AppError(401, 'Authentication token is invalid or expired.', 'UNAUTHORIZED');
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    throw new AppError(401, 'User no longer exists.', 'UNAUTHORIZED');
  }
  req.user = user;
  next();
});
