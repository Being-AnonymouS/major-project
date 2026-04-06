import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import adminRoutes from './routes/adminRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import authRoutes from './routes/authRoutes';
import messageRoutes from './routes/messageRoutes';
import ratingRoutes from './routes/ratingRoutes';
import userRoutes from './routes/userRoutes';
import { validateSecurityConfig } from './config/security';
import { getCorsOptions, customCorsMiddleware, corsErrorHandler } from './middleware/corsConfig';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';
import { comprehensiveInputSanitization } from './middleware/inputSanitization';
import { addTokenRefreshInfo, checkTokenHealth } from './middleware/tokenRefresh';
import { suspiciousRequestMiddleware } from './utils/securityMonitor';

dotenv.config();

let hasValidatedSecurityConfig = false;

const ensureSecurityConfig = (): void => {
  if (hasValidatedSecurityConfig) {
    return;
  }

  const securityValidation = validateSecurityConfig();
  if (!securityValidation.isValid) {
    console.error('Security configuration validation failed:');
    securityValidation.errors.forEach((error) => console.error(`- ${error}`));

    if (process.env.NODE_ENV === 'production') {
      throw new Error('Security configuration validation failed in production');
    }
  }

  hasValidatedSecurityConfig = true;
};

export const createApp = (): Express => {
  ensureSecurityConfig();

  const app = express();

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  app.use(customCorsMiddleware);
  app.use(cors(getCorsOptions()));
  app.use(morgan('combined'));

  app.use(express.json({
    limit: '1mb',
    verify: (_req, _res, buf) => {
      if (buf.length === 0) {
        throw new Error('Empty request body');
      }
    },
  }));

  app.use(express.urlencoded({
    extended: true,
    limit: '1mb',
    parameterLimit: 100,
  }));

  app.use(suspiciousRequestMiddleware);
  app.use(comprehensiveInputSanitization);

  app.use('/api', addTokenRefreshInfo);
  app.use('/api', checkTokenHealth);

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/ratings', ratingRoutes);
  app.use('/api/admin', adminRoutes);

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'OK',
      message: 'Mentor Connect API is running',
      timestamp: new Date().toISOString(),
    });
  });

  app.use(corsErrorHandler);
  app.use('*', notFoundHandler);
  app.use(globalErrorHandler);

  return app;
};
