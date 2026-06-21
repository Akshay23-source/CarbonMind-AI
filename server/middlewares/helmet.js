import helmet from 'helmet';

/**
 * Helmet Security Headers Middleware
 * Configures HTTP headers to protect against common web vulnerabilities.
 */
export const helmetMiddleware = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
});
