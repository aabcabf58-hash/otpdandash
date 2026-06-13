import { AppError } from '../utils/AppError.js';

export const validate = (schema) => (req, _res, next) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join(' ');
    return next(new AppError(400, message, 'VALIDATION_ERROR'));
  }
  req.body = parsed.data;
  next();
};
