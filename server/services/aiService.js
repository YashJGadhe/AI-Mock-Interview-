/**
 * AI Service Router
 * Uses Google Gemini if GEMINI_API_KEY is set in .env,
 * otherwise falls back to the built-in local question bank (no API key needed).
 */

let service;
let serviceName;

if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  service = require('./geminiService');
  serviceName = 'Google Gemini 1.5 Flash (Free)';
} else {
  service = require('./localService');
  serviceName = 'Local offline mode (no API key set)';
}

console.log(`🤖 AI Service: ${serviceName}`);

module.exports = service;
