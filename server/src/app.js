import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';

import healthRoutes from './routes/health.js';
import medicinesRoutes from './routes/medicines.js';
import patientsRoutes from './routes/patients.js';
import prescriptionsRoutes from './routes/prescriptions.js';
import aiRoutes from './routes/ai.js';
import authRoutes from './routes/auth.js';
import remindersRoutes from './routes/reminders.js';

const app = express();

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or same-origin
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      config.clientUrl,
      'http://localhost:3000',
      'http://localhost:5000',
    ];

    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      process.env.NODE_ENV === 'development'
    ) {
      return callback(null, true);
    }

    return callback(null, true); // Permissive fallback to prevent breaking deployments
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicinesRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/prescriptions', prescriptionsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reminders', remindersRoutes);

// Root fallback
app.get('/', (req, res) => {
  res.json({
    message: 'AI-Powered Medication Management Backend is running',
    version: '1.0.0',
    endpoints: [
      '/api/health',
      '/api/auth',
      '/api/medicines',
      '/api/patients',
      '/api/prescriptions',
      '/api/ai',
      '/api/reminders'
    ]
  });
});

export default app;
