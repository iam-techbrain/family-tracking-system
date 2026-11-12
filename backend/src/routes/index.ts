import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import { sendSuccess } from '../utils/response';

const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (_req, res) => {
  sendSuccess(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }, 'Family Circle API is running healthy');
});

// Mounted domain routes
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);

export default apiRouter;

