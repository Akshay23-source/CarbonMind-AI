import { body, validationResult } from 'express-validator';

/**
 * Handle Validation Errors Middleware
 */
export const validateFields = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * Registration Input Validation Rules
 */
export const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Must supply a valid email address').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must contain at least 8 characters')
];

/**
 * Login Input Validation Rules
 */
export const loginRules = [
  body('email').trim().isEmail().withMessage('Must supply a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password cannot be empty')
];
