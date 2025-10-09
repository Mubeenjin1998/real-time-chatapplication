const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const socketIo = require('socket.io');
const app = require('./src/app');
const socketHandler = require('./src/socket/socketHandler');
const { initializeRedis } = require('./src/services/redisService');
const { connectDB } = require('./src/config/database');
const logger = require('./src/utils/logger');

console.log('MONGODB_URI:', process.env.MONGODB_URI);

// Connect to database
connectDB();

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Initialize Redis
initializeRedis();

// Initialize socket handler
socketHandler(io);

// Start server
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

module.exports = { server, io };
