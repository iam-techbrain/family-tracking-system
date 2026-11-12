import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { prisma } from './config/database';
import { initSocketIO } from './sockets';
import { startRetentionJobScheduler } from './jobs/retentionJob';

async function bootstrap() {
  const app = createApp();
  const server = http.createServer(app);

  // Initialize WebSockets
  const io = initSocketIO(server);

  // Start background retention scheduler
  const retentionInterval = startRetentionJobScheduler();

  const port = env.PORT;
  const host = env.BIND_ADDRESS;

  server.listen(port, host, () => {
    logger.info(
      `🚀 Family Circle Backend server running on http://${host}:${port}`
    );
    logger.info(`📚 Swagger Documentation: http://${host}:${port}/api/docs`);
    logger.info(`📡 Socket.IO server mounted and listening`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    clearInterval(retentionInterval);

    server.close(async () => {
      logger.info('HTTP and WebSocket server closed.');

      io.close();

      try {
        await prisma.$disconnect();
        logger.info('Prisma database connection closed.');
      } catch (err) {
        logger.error({ err }, 'Error during Prisma disconnect');
      }

      logger.info('Graceful shutdown completed.');
      process.exit(0);
    });

    // Force exit if shutdown takes longer than 10 seconds
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled Rejection detected');
  });

  process.on('uncaughtException', (error) => {
    logger.fatal({ err: error }, 'Uncaught Exception detected');
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  logger.fatal({ err }, 'Fatal bootstrap failure');
  process.exit(1);
});

