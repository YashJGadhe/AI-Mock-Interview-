# 🎯 AI Mock Job Interview

A full-stack web application for practicing job interviews with AI-generated questions and intelligent feedback — powered by **Google Gemini** (free, no credit card needed).

---

## ✨ Features

- **JWT Authentication** — Secure signup, login, logout with hashed passwords
- **Dashboard** — Interview statistics, history, and quick-start
- **Interview Setup** — Choose job role, type (HR/Technical/Behavioral), difficulty
- **Mock Interview** — AI-generated questions, per-question timer, text + voice input
- **AI Feedback** — Score, grade, strengths, weaknesses, and improvement suggestions
- **Interview History** — Browse past sessions with scores and detailed feedback
- **Learning Resources** — Tips, question bank, video tutorials
- **Profile Management** — Edit profile, upload resume, track analytics

---

## 🛠 Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, React Router v6, Recharts     |
| Backend    | Node.js, Express.js                     |
| Database   | MongoDB + Mongoose                      |
| AI         | Google Gemini 1.5 Flash API (Free)      |
| Auth       | JWT + bcryptjs                          |
| Styling    | CSS Modules + CSS Variables             |
| Fonts      | Google Fonts (Poppins)                  |

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB (local install or free MongoDB Atlas)
- Google Gemini API key (free — takes 2 minutes)

---

### Step 1 — Get your free Gemini API key

1. Go to **[aistudio.google.com](https://aistudio.google.com)**
2. Sign in with your Google account
3. Click **"Get API Key"** → **"Create API key"**
4. Copy the key (starts with `AIzaSy...`)

---

### Step 2 — Clone & Install

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

---

### Step 3 — Configure environment variables

**Server** — copy and fill in `server/.env`:
```bash
cp server/.env.example server/.env
```

Then edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai_mock_interview

# Generate JWT secret by running this in your terminal:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=paste_your_generated_secret_here
JWT_EXPIRES_IN=7d

# Your free Gemini API key from aistudio.google.com
GEMINI_API_KEY=AIzaSy...your-key-here

CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

**Client** — copy `client/.env`:
```bash
cp client/.env.example client/.env
```

`client/.env` contents (no changes needed):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

### Step 4 — Seed the database

```bash
cd server
node ../database/seed.js
```

This creates sample resources and a demo user.

---

### Step 5 — Run the application

Open **two terminals**:

```bash
# Terminal 1 — Backend API
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm start
```

- Frontend: **http://localhost:3000**
- Backend API: **http://localhost:5000**

---

### Demo Login

| Field    | Value                    |
|----------|--------------------------|
| Email    | `demo@aiinterview.com`   |
| Password | `demo123456`             |

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint            | Description      |
|--------|---------------------|------------------|
| POST   | /api/auth/signup    | Register user    |
| POST   | /api/auth/login     | Login user       |
| GET    | /api/auth/profile   | Get profile      |
| PUT    | /api/auth/profile   | Update profile   |

### Interviews
| Method | Endpoint                       | Description          |
|--------|--------------------------------|----------------------|
| POST   | /api/interview/start           | Start new interview  |
| GET    | /api/interview/questions/:id   | Get questions        |
| POST   | /api/interview/submit          | Submit answers       |
| GET    | /api/interview/history         | Get history          |
| GET    | /api/interview/:id             | Get single interview |

### AI Feedback
| Method | Endpoint          | Description             |
|--------|-------------------|-------------------------|
| POST   | /api/ai/feedback  | Generate Gemini feedback|

### Resources & Profile
| Method | Endpoint               | Description       |
|--------|------------------------|-------------------|
| GET    | /api/resources         | Get all resources |
| POST   | /api/profile/resume    | Upload resume     |
| GET    | /api/profile/analytics | Get analytics     |

---

## 🎨 Design System

```
Primary:    #4F46E5  (Indigo)
Secondary:  #22C55E  (Green)
Background: #F9FAFB  (Light gray)
Text:       #1F2937  (Dark gray)
Font:       Poppins (Google Fonts)
```

---

## 📄 License

MIT — free to use and modify.
