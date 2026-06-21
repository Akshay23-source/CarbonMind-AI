# CarbonMind AI - Architecture & Developer Guide

This document describes the design patterns, code structure, APIs, security guidelines, and development guidelines for CarbonMind AI.

---

## 🏛️ System Architecture

CarbonMind AI follows a clean, decoupled architecture:
1. **Client Layer (React & Vite)**:
   - Uses TypeScript for strong static typing.
   - Global state management (Authentication, theme triggers, notification streams) handled in Contexts (`AuthContext.tsx`, `ThemeContext.tsx`).
   - Clean modular layouts and visual presenters using Tailwind CSS styling and Framer Motion exit-animations.
2. **Controller Layer (Express Backend)**:
   - Handles route protection via a robust JWT parser middleware (`requireAuth`).
   - Validates fields through schema sanitization checks to ensure high data integrity.
   - Deploys Helmet headers and IP rate-limiting (`express-rate-limit`) to prevent brute-force abuse.
3. **AI Services & Engine**:
   - Leverages Google Gemini models (`gemini-1.5-flash`) for natural language activity logs parsing, nutrition audits, receipt Vision OCR processing, and smart travel recommendations.
   - Utilizes `carbonEngine.js` calculations to convert parsed activities (km traveled, food choices, electrical appliance power) into equivalent offsets, XP, and Green Coins.

---

## 🔒 Security & Data Sanitization

### 1. Prompt Injection Protection
Repetitive user input strings sent to Gemini are sanitized on the backend through regex filters in `aiController.js` to block system instructions overrides (e.g. ignoring previous prompts). Input structures explicitly isolate user query logs from system prompt constraints:
```javascript
const sanitizeInput = (text) => {
  return text
    .replace(/system\b/gi, '')
    .replace(/instruction\b/gi, '')
    .replace(/ignore\s+previous/gi, '')
    .replace(/override/gi, '')
    .replace(/translate\s+to\s+json/gi, '')
    .trim();
};
```

### 2. Firestore Security Rules
All database queries match document owner UIDs. Admin operations (such as loading global leaderboards, updating available challenges, or adding rewards) are locked using token verification roles.

---

## ⚡ Performance Optimizations

### 1. In-Memory API Caching
To optimize latency and minimize token consumption overhead, we deploy an in-memory TTL cache mapping for static endpoints:
- Natural language logs (`/api/ai/scan`)
- Predictions (`/api/ai/predict`)
- Proactive coach suggestions (`/api/ai/motivation`, `/api/ai/copilot/briefing`)

### 2. GPU-Accelerated Canvases & Vector Maps
- Animations (starfields, falling leaf particles, and confetti explosions) are drawn on native HTML5 canvas loops, preventing DOM-layer CPU stress.
- Leaflet map layouts leverage inline vector overlay lines and clusters to ensure smooth 60 FPS navigations on mobile/tablet widths.

---

## 🌐 Environment Variables

Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
GEMINI_API_KEY=your-google-gemini-api-key
FIREBASE_SERVICE_ACCOUNT_KEY=path-to-your-firebase-key.json
```
