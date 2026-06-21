import { validationResult } from 'express-validator';

/**
 * Handle Fields Validation Errors Middleware
 * Checks if the request contains validation errors and returns 400 with details.
 */
export const validateFields = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
