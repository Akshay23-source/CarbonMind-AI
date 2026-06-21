import rateLimit from 'express-rate-limit';

/**
 * API Requests Rate Limiter Middleware
 * Restricts client IP addresses to 100 requests per 15-minute window.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
