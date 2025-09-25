// src/config.js
export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://wings-cafe2-backend.vercel.app'
  : 'http://localhost:5001';
