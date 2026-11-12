import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { logger } from '../config/logger';
import { env } from '../config/env';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // Socket Authentication Middleware
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication error: Missing token'));
      }

      const payload = verifyAccessToken(token);
      socket.userId = payload.userId;
      socket.userEmail = payload.email;
      next();
    } catch {
      next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId;
    logger.info({ userId, socketId: socket.id }, 'Socket client connected');

    // Join personal room for targeted notifications
    if (userId) {
      socket.join(`user:${userId}`);
    }

    // Join family room handler (verified in phase 2)
    socket.on('family:join', (familyId: string) => {
      if (familyId) {
        socket.join(`family:${familyId}`);
        logger.info({ userId, familyId }, 'Socket joined family room');
      }
    });

    // Leave family room
    socket.on('family:leave', (familyId: string) => {
      if (familyId) {
        socket.leave(`family:${familyId}`);
      }
    });

    // Handle client disconnect
    socket.on('disconnect', (reason) => {
      logger.info({ userId, socketId: socket.id, reason }, 'Socket disconnected');
    });
  });

  return io;
}

