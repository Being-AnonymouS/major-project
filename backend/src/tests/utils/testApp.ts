import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { globalErrorHandler } from '../../middleware/errorHandler';
import { getCorsOptions } from '../../middleware/corsConfig';
import authRoutes from '../../routes/authRoutes';
import userRoutes from '../../routes/userRoutes';
import appointmentRoutes from '../../routes/appointmentRoutes';
import messageRoutes from '../../routes/messageRoutes';
import ratingRoutes from '../../routes/ratingRoutes';
import adminRoutes from '../../routes/adminRoutes';

export const createTestApp = (): Express => {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors(getCorsOptions()));

  // Logging middleware (only in test environment)
  if (process.env.NODE_ENV === 'test') {
    app.use(morgan('combined'));
  }

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/ratings', ratingRoutes);
  app.use('/api/admin', adminRoutes);

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // Error handling middleware (must be last)
  app.use(globalErrorHandler);

  return app;
};