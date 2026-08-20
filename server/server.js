/**
 * server.js
 * Configures Express (middleware, routes, error handling), connects to
 * MongoDB, and handles serverless requests on Vercel.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const constants = require('./config/constants');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const listingRoutes = require('./routes/listingRoutes');
const swapRoutes = require('./routes/swapRoutes');

const app = express();

/* --------------------------- Core middleware --------------------------- */

app.use(
  cors({
    origin: "https://skill-exchange-frontend-lyart.vercel.app",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------- Serverless DB Connection ------------------------ */

// Ensures MongoDB connects before processing any incoming route on Vercel
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database Connection Error:', err.message);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

/* ------------------------------- Routes -------------------------------- */

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'SkillExchange API', time: new Date().toISOString() });
});

// Option lists, so the frontend dropdowns always match the backend rules
app.get('/api/meta', (req, res) => res.json(constants));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/swaps', swapRoutes);

/* --------------------------- Error handling ---------------------------- */

app.use(notFound);
app.use(errorHandler);

/* ------------------------------- Startup ------------------------------- */

// Run local server only when running locally directly (`node server.js`)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`SkillExchange API running on http://localhost:${PORT}`);
  });
}

module.exports = app;