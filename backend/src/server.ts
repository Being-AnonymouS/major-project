import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import messageRoutes from './routes/messageRoutes';
import ratingRoutes from './routes/ratingRoutes';
import adminRoutes from './routes/adminRoutes';
import { SocketManager } from './utils/socketManager';
// import rateLimiter from './middleware/rateLimiter'; // Temporarily disabled for development
import { getCorsOptions, customCorsMiddleware, corsErrorHandler, isOriginAllowed } from './middleware/corsConfig';
import { comprehensiveInputSanitization } from './middleware/inputSanitization';
import { addTokenRefreshInfo, checkTokenHealth } from './middleware/tokenRefresh';
import { suspiciousRequestMiddleware } from './utils/securityMonitor';
import { validateSecurityConfig } from './config/security';
// Load environment variables
dotenv.config();
// Validate security configuration
const securityValidation = validateSecurityConfig();
if (!securityValidation.isValid) {
  console.error('Security configuration validation failed:');
  securityValidation.errors.forEach(error => console.error(`- ${error}`));
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || isOriginAllowed(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS policy'));
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
const PORT = process.env.PORT || 5000;
// Enhanced security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for Socket.io compatibility
}));
// Enhanced CORS configuration
app.use(customCorsMiddleware);
app.use(cors(getCorsOptions()));
// Logging middleware
app.use(morgan('combined'));
// Body parsing with size limits
app.use(express.json({ 
  limit: '1mb', // Reduced from 10mb for security
  verify: (_req, _res, buf) => {
    // Additional verification can be added here
    if (buf.length === 0) {
      throw new Error('Empty request body');
    }
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '1mb',
  parameterLimit: 100 // Limit number of parameters
}));
// Security monitoring for suspicious requests
app.use(suspiciousRequestMiddleware);
// Comprehensive input sanitization
app.use(comprehensiveInputSanitization);
// Token refresh middleware for all API routes
app.use('/api', addTokenRefreshInfo);
app.use('/api', checkTokenHealth);
// Apply rate limiting
// Temporarily disabled for development
// app.use('/api/auth', rateLimiter.auth);
// app.use('/api', rateLimiter.api);
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/admin', adminRoutes);
// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OK',
    message: 'Mentor Connect API is running',
    timestamp: new Date().toISOString(),
  });
});
// Initialize Socket Manager
const socketManagerInstance = new SocketManager(io);
// Set in socket service for use in other modules
import { setSocketManager } from './services/socketService';
setSocketManager(socketManagerInstance);
// Export for use in other modules
export { socketManagerInstance as socketManager };
// Import error handling middleware
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';
// CORS error handler
app.use(corsErrorHandler);
// 404 handler (must be before global error handler)
app.use('*', notFoundHandler);
// Global error handling middleware (must be last)
app.use(globalErrorHandler);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server ready for connections`);
});
