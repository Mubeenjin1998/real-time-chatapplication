const messageEvents = (socket, io) => {
  // Send message
  socket.on('message:send', (data) => {
    // Broadcast to chat room
    socket.to(data.chatId).emit('message:receive', data);
  });

  // Message read
  socket.on('message:read', (data) => {
    socket.to(data.chatId).emit('message:read', data);
  });
};

module.exports = messageEvents;
