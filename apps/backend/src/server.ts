import { createServer } from 'http';
import app from './app';
import { config } from './config';
import { connectDB } from './config/database';
import { initSocket } from './socket';

const startServer = async () => {
  try {
    await connectDB();

    const httpServer = createServer(app);
    initSocket(httpServer);

    httpServer.listen(config.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${config.PORT}`);
      console.log(`📊 Health check: http://localhost:${config.PORT}/health`);
      console.log(`🔌 Socket.io ready`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
