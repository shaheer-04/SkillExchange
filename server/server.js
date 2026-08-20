/**
 * server.js
 * Configures Express (middleware, routes, error handling), connects to
 * MongoDB and starts the HTTP server.
 *
 * All real logic lives in routes -> controllers -> models.
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

// CLIENT_URL can hold one origin or a comma separated list.
// If it is not set we allow every origin, which is convenient in development.
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: "https://skill-exchange-frontend-lyart.vercel.app",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`SkillExchange API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start the server:', err.message);
    process.exit(1);
  }
}

// Only start listening when this file is run directly (`npm start`).
// When it is imported by the test suite the tests start the server themselves.
if (require.main === module) {
  start();
}

module.exports = app;
