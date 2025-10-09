const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import configurations
const { connectDB } = require('./config/database');
const redisClient = require('./config/redis');

// Import routes
// const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
// const chatRoutes = require('./routes/chatRoutes');
// const messageRoutes = require('./routes/messageRoutes');
// const fileRoutes = require('./routes/fileRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
// app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// app.use('/api/chats', chatRoutes);
// app.use('/api/messages', messageRoutes);
// app.use('/api/files', fileRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
