import jwt from 'jsonwebtoken';
import { auth as firebaseAuth } from '../config/db.js';

/**
 * JWT Verification Middleware
 * Validates request authorization tokens. Supports standard JSONWebTokens
 * and coordinates with Firebase admin tokens.
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header is missing or malformed' });
    }

    const token = authHeader.split(' ')[1];

    // Development Mock Bypass
    if (token.startsWith('mock-jwt-')) {
      req.user = {
        uid: 'usr_mock_id',
        email: 'mock.user@carbonmind.ai',
        role: 'user'
      };
      return next();
    }

    if (!firebaseAuth) {
      return res.status(503).json({ error: 'Firebase Auth is offline. Local bypass requires a mock-jwt token prefix.' });
    }

    // Verify Firebase Admin Token
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      role: decodedToken.role || 'user'
    };

    next();
  } catch (error) {
    console.error('[Auth Middleware] Verification failed:', error);
    res.status(401).json({ error: 'Access denied. Invalid signature token.' });
  }
};

/**
 * Role-Based Access Control Middleware
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient workspace permissions.' });
    }
    next();
  };
};
