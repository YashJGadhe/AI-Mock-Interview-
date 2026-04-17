# API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require `Authorization: Bearer <token>` header.

---

## Authentication

### POST /auth/signup
Register a new user.

**Body:**
```json
{
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "password": "securepassword123"
}
```

**Response 201:**
```json
{
  "message": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "name": "Alex Johnson", "email": "alex@example.com" }
}
```

---

### POST /auth/login
Log in with credentials.

**Body:**
```json
{ "email": "alex@example.com", "password": "securepassword123" }
```

**Response 200:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "name": "Alex Johnson", "stats": {...} }
}
```

---

### GET /auth/profile *(protected)*
Get the current user's profile.

**Response 200:**
```json
{ "user": { "id": "...", "name": "...", "email": "...", "stats": {...} } }
```

---

### PUT /auth/profile *(protected)*
Update profile fields.

**Body (all optional):**
```json
{
  "name": "Alex Johnson",
  "bio": "Full-stack developer...",
  "jobTitle": "Software Engineer",
  "targetRole": "Senior Engineer",
  "experience": "3-5 years",
  "skills": ["React", "Node.js"],
  "linkedIn": "https://linkedin.com/in/...",
  "github": "https://github.com/..."
}
```

---

## Interviews

### POST /interview/start *(protected)*
Start a new interview session. Generates AI questions.

**Body:**
```json
{
  "jobRole": "Software Engineer",
  "interviewType": "technical",
  "difficulty": "medium",
  "questionCount": 5
}
```

**Response 201:**
```json
{
  "message": "Interview started",
  "interview": {
    "id": "...",
    "sessionId": "session_...",
    "jobRole": "Software Engineer",
    "interviewType": "technical",
    "difficulty": "medium",
    "questions": [
      { "text": "...", "category": "...", "expectedKeyPoints": ["..."] }
    ],
    "startedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

### GET /interview/questions/:interviewId *(protected)*
Get questions for an existing interview session.

---

### POST /interview/submit *(protected)*
Submit all answers for a completed interview.

**Body:**
```json
{
  "interviewId": "...",
  "answers": [
    {
      "questionId": "...",
      "questionText": "Tell me about yourself",
      "answerText": "I am a software developer with...",
      "timeSpent": 120,
      "isSkipped": false
    }
  ]
}
```

**Response 200:**
```json
{
  "message": "Interview submitted successfully",
  "interviewId": "...",
  "duration": 25
}
```

---

### GET /interview/history *(protected)*
Get paginated interview history.

**Query params:** `page`, `limit`, `type` (hr|technical|behavioral), `status`

**Response 200:**
```json
{
  "interviews": [...],
  "pagination": { "total": 15, "page": 1, "limit": 10, "pages": 2 }
}
```

---

### GET /interview/:id *(protected)*
Get a single complete interview with all answers and feedback.

---

### PATCH /interview/:id/abandon *(protected)*
Mark an in-progress interview as abandoned.

---

## AI Feedback

### POST /ai/feedback *(protected)*
Generate AI-powered feedback for a completed interview. Returns cached feedback on subsequent calls.

**Body:**
```json
{ "interviewId": "..." }
```

**Response 200:**
```json
{
  "message": "Feedback generated successfully",
  "feedback": {
    "overallScore": 78,
    "grade": "B+",
    "summary": "You demonstrated solid technical knowledge...",
    "strengths": ["Clear communication", "Good examples"],
    "weaknesses": ["Could go deeper on system design"],
    "suggestions": ["Practice STAR method", "Review distributed systems"],
    "perAnswerFeedback": [
      {
        "questionText": "...",
        "answerText": "...",
        "score": 82,
        "comment": "Strong answer with specific examples..."
      }
    ]
  },
  "cached": false
}
```

---

## Resources

### GET /resources *(protected)*
Get all learning resources.

**Query params:** `type` (tip|question|video|article|guide), `category`, `page`, `limit`

**Response 200:**
```json
{
  "resources": [...],
  "grouped": {
    "tips": [...],
    "questions": [...],
    "videos": [...],
    "articles": [...],
    "guides": [...]
  },
  "total": 13
}
```

---

## Profile

### POST /profile/resume *(protected)*
Upload a resume file (PDF/DOC/DOCX, max 5MB).

**Body:** `multipart/form-data` with `resume` file field.

---

### GET /profile/analytics *(protected)*
Get score history and type breakdown for charts.

**Response 200:**
```json
{
  "scoreOverTime": [
    { "date": "2024-01-15", "score": 78, "type": "technical", "jobRole": "..." }
  ],
  "avgByType": { "hr": 75, "technical": 80, "behavioral": 72 },
  "user": { "totalInterviews": 10, "averageScore": 76, "bestScore": 92 }
}
```

---

## Error Responses

All errors follow this format:

```json
{ "error": "Human-readable error message" }
```

| Status | Meaning                         |
|--------|---------------------------------|
| 400    | Bad request / validation failed |
| 401    | Unauthenticated                 |
| 403    | Forbidden                       |
| 404    | Resource not found              |
| 409    | Conflict (e.g. duplicate email) |
| 429    | Rate limit exceeded             |
| 500    | Internal server error           |
