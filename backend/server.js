import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './models/database.js';
import client from 'prom-client';

import userRoutes from './routes/users.js';
import taskRoutes from './routes/tasks.js';
import statsRoutes from './routes/stats.js';

import { userTimezoneMiddleware } from './middleware/timezone.js';
import maxAuthMiddleware from './middleware/maxAuth.js'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 5, 15, 50, 100, 500]
});

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(userTimezoneMiddleware);
app.use(maxAuthMiddleware);

app.use((req, res, next) => {
  res.locals.startEpoch = Date.now();
  next();
});

app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/stats', statsRoutes);

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timezone: req.userTimezone 
  });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'OK', 
      message: 'Database connected successfully',
      time: result.rows[0].now,
      timezone: req.userTimezone
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

app.use((req, res, next) => {
  const responseTimeInMs = Date.now() - res.locals.startEpoch;
  httpRequestDurationMicroseconds
    .labels(req.method, req.route?.path || req.path, res.statusCode)
    .observe(responseTimeInMs);
  next();
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`📈 Metrics available at http://localhost:${PORT}/metrics`);
  console.log(`❤️ Health check: http://localhost:${PORT}/api/health`);
});