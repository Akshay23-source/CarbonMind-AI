# Security Documentation (SECURITY.md)

This document provides a comprehensive overview of the security architecture and defensive measures implemented in the CarbonMind AI platform.

---

## 1. Authentication & JWT Validation

The application utilizes a stateless, token-based authentication mechanism.
- **Firebase Token Verification**: In production, client requests must pass a valid Firebase ID Token inside the `Authorization: Bearer <token>` header. The token signature is validated on the server via `firebase-admin` authentication checks.
- **Development Mock Bypass**: To streamline local development, requests containing token payloads starting with `mock-jwt-` are bypassed. Additionally, if the server environment is configured as `development` (`process.env.NODE_ENV === 'development'`), missing or malformed headers fall back to a predefined local mock user profile.

---

## 2. Role-Based Access Control (RBAC)

Strict middleware (`requireRole`) gates actions by analyzing user payload objects injected by the authorization middleware.
- Handlers specify arrays of allowed privileges, ensuring standard users cannot perform admin actions or access restricted system resources.

---

## 3. Helmet & HTTP Security Headers

Express leverages the `helmet` middleware wrapper to automatically apply robust HTTP security header defenses:
- **Clickjacking Protection**: Disallows frame inclusion (`X-Frame-Options: SAMEORIGIN`).
- **MIME Sniffing Prevention**: Blocks browsers from sniffing response body types (`X-Content-Type-Options: nosniff`).
- **XSS Protections**: Enforces default browser filters (`X-XSS-Protection: 0`).
- **CSP & COEP Adjustments**: Content Security Policy (`contentSecurityPolicy`) and Cross-Origin Embedder Policy (`crossOriginEmbedderPolicy`) are explicitly adjusted for optimized local integration of external open-source maps and font resources.

---

## 4. CORS Strategy

Cross-Origin Resource Sharing (CORS) limits external request execution to authorized domains:
- Whitelisted domains are parsed dynamically from the `CLIENT_URL` environment variable.
- In development environments, local hostnames (`localhost:3000`, `localhost:3001`, `127.0.0.1:3001`) are added to allow cross-origin communication with Vite frontends.
- Production CORS checkers dynamically allow secure subdomains ending with `.vercel.app` or `.onrender.com` to simplify preview builds.

---

## 5. Rate Limiting

To prevent Denial of Service (DoS) attempts and API abuse:
- The `express-rate-limit` package is mounted globally.
- Requests targeting `/api/` endpoints are limited to `100 requests per 15 minutes` per unique IP address.

---

## 6. Environment Validation

To prevent starting the server in a broken or misconfigured state, a startup environment validator ensures that crucial variables are verified before runtime:
- Verifies that `GEMINI_API_KEY` is present.
- Emits explicit console warnings if credentials are missing to prevent service degradation.

---

## 7. Input Validation & Sanitization

To ensure data integrity and prevent SQL injection or schema issues:
- Input constraints are checked at the router layer using `express-validator`.
- String fields undergo trimming (`.trim()`) and checks for presence or length (`.isLength()`).
- Validation errors are compiled by a centralized `validateFields` middleware, returning clean `400 Bad Request` messages to the caller.

---

## 8. Prompt Injection Protection

The backend actively monitors text prompts forwarded to generative models to defend against prompt injection/jailbreaking attempts:
- A strict blocklist filter checks user text inputs for keywords like:
  - `ignore previous instructions`
  - `developer mode`
  - `system prompt`
  - `jailbreak`
  - `bypass safety`
- If unsafe sequences are detected, requests are terminated immediately with status `400` returning `{"success": false, "message": "Unsafe Prompt"}` to prevent model hijack.

---

## 9. Request Tracing & Error Handling

- **Request IDs**: The server attaches a unique UUID tracing token (`req.requestId`) to each request via a global tracing middleware to simplify log analysis.
- **Generic Error Responses**: Global Express error handlers are configured to return generic, professional JSON payloads (`{ "success": false, "message": "Internal Server Error" }`) on `500` status codes, avoiding raw stack trace leaks to end-users.

---

## 10. Deployment & HTTPS Best Practices

For hosting production releases:
- Set `NODE_ENV=production` to disable verbose diagnostic stack traces.
- Enforce HTTPS traffic (`SSL/TLS`) globally.
- Store sensitive configuration variables (e.g. `FIREBASE_SERVICE_ACCOUNT_KEY`, `GEMINI_API_KEY`) securely within your cloud secrets manager.
