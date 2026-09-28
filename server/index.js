/**
 * AI Mock Job Interview - Server Entry Point
 * Express.js REST API with MongoDB and Gemini integration
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/database');

const authRoutes = require('./routes/auth');
const interviewRoutes = require('./routes/interview');
const aiRoutes = require('./routes/ai');
const resourceRoutes = require('./routes/resources');
const profileRoutes = require('./routes/profile');

const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── Security Middleware ──────────────────────────────────────────
app.use(helmet());

const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL,
  'https://ai-mock-interview-vrd6.vercel.app'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ── Rate Limiting ────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Too many requests, please try again later.',
  },
});

app.use('/api/', limiter);

// ── Body Parsing ─────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ──────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Static Files ─────────────────────────────────────────────────
app.use('/uploads', express.static('uploads'));

// ── Routes ───────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/profile', profileRoutes);

// ── Health Check ─────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// ── 404 Handler ──────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
  });
});

// ── Global Error Handler ─────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // MongoDB connection
    await connectDB();

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(
        `📡 Environment: ${process.env.NODE_ENV || 'development'}`
      );
      console.log(
        `🌐 Client URL: ${
          process.env.CLIENT_URL || 'http://localhost:3000'
        }\n`
      );
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;