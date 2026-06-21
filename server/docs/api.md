# CarbonMind AI — Express API Documentation

All platform operations are exposed via a structured HTTP API endpoint tree running on port `5000` (development proxy active on frontend port `3000`).

---

## Authentication Endpoints (`/api/auth`)

### 1. `POST /register`
Creates new user pioneer credentials profiles.
*   **Body parameters**:
    ```json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "password": "securepassword123"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "message": "User registered successfully",
      "token": "mock-jwt-token-header.payload.signature",
      "user": {
        "email": "john@example.com",
        "displayName": "John Doe",
        "role": "user"
      }
    }
    ```

### 2. `POST /login`
Authenticates existing credentials.
*   **Body parameters**:
    ```json
    {
      "email": "john@example.com",
      "password": "securepassword123"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "message": "Login successful",
      "token": "mock-jwt-token",
      "user": { ... }
    }
    ```

---

## AI Coach & Analysis Endpoints (`/api/ai`)
*   *Note: All AI routes require an Authorization Bearer header: `Authorization: Bearer <token>`.*

### 1. `POST /coach`
Sends message prompts to the Google Gemini Coach.
*   **Body parameters**:
    ```json
    {
      "message": "How do I offset commuting carbon?",
      "history": []
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "role": "model",
      "content": "To offset travel carbon, replace vehicle commuting with train transit or bicycle paths..."
    }
    ```

### 2. `POST /predict`
Processes activity trend reports to calculate future forecast milestones.
*   **Body parameters**:
    ```json
    {
      "data": [
        { "date": "Mon", "value": 12.4 },
        { "date": "Tue", "value": 8.1 }
      ]
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "monthlyProjectedCarbon": 310.4,
      "reductionPercentage": 12.8,
      "criticalMilestoneDate": "2026-11-01",
      "trendInsights": [ ... ]
    }
    ```

---

## Rate Limiting & Errors
- **Rate Limit**: API paths are restricted to 100 requests per 15 minutes window per IP. Exceeding this triggers a `429 Too Many Requests` response.
- **Global Error Handler**: Returns standardized JSON error representations:
  ```json
  {
    "error": "Access denied. Invalid signature token."
  }
  ```
