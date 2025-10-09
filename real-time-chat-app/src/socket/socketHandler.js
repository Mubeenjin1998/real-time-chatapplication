const userEvents = require('./userEvents');
const chatEvents = require('./chatEvents');
const messageEvents = require('./messageEvents');
const typingEvents = require('./typingEvents');

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Initialize event handlers
    userEvents(socket, io);
    chatEvents(socket, io);
    messageEvents(socket, io);
    typingEvents(socket, io);

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = socketHandler;
