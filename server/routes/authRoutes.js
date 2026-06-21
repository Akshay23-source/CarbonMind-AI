import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { registerRules, loginRules, validateFields } from '../validators/authValidator.js';

const router = Router();

// 1. REGISTER
router.post('/register', registerRules, validateFields, (req, res) => {
  const { email, name } = req.body;
  // Simulate JWT Token generation
  const mockToken = 'mock-jwt-token-header.payload.signature';
  res.status(201).json({
    message: 'User registered successfully',
    token: mockToken,
    user: { email, displayName: name, role: 'user' }
  });
});

// 2. LOGIN
router.post('/login', loginRules, validateFields, (req, res) => {
  const { email } = req.body;
  const mockToken = 'mock-jwt-token-header.payload.signature';
  res.status(200).json({
    message: 'Login successful',
    token: mockToken,
    user: { email, displayName: email.split('@')[0], role: 'user' }
  });
});

// 3. GOOGLE TOKEN EXCHANGE
router.post('/google', (req, res) => {
  const { idToken } = req.body;
  const mockToken = 'mock-jwt-google-token';
  res.status(200).json({
    message: 'Google login verified',
    token: mockToken,
    user: { email: 'google.user@gmail.com', displayName: 'Eco Pioneer', role: 'user' }
  });
});

// 4. GET ACTIVE USER DETAILS
router.get('/me', requireAuth, (req, res) => {
  res.status(200).json({ user: req.user });
});

export default router;
