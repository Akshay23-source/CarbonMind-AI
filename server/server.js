import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import compression from 'compression';
import crypto from 'crypto';

// Import Security Middlewares
import { helmetMiddleware } from './middlewares/helmet.js';
import { apiLimiter } from './middlewares/rateLimiter.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

// Startup Environment Validator
const required = ["GEMINI_API_KEY"];
required.forEach((env) => {
  if (!process.env[env]) {
    console.warn(`${env} missing`);
  }
});

const app = express();
const PORT = process.env.PORT || 5000;

// Hide Express fingerprinting
app.disable('x-powered-by');

// Request compression
app.use(compression());

// Request tracing ID middleware
app.use((req, res, next) => {
  req.requestId = crypto.randomUUID();
  next();
});

// Security Middlewares
app.use(helmetMiddleware);
// CORS Settings with dynamic support for localhost and Vercel subdomains
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = [
      process.env.CLIENT_URL,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:5173'
    ].filter(Boolean);
    if (allowed.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Body Parsers & Sanitizers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate Limiting (DDoS prevention)
app.use('/api/', apiLimiter);

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'CarbonMind AI Backend API Active',
    health: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Test Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Express Error Boundary caught:', err);
  const status = err.statusCode || 500;
  if (status === 500) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
  res.status(status).json({
    success: false,
    message: err.message || 'Error occurred',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[CarbonMind API] Server active on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});

export default app;
