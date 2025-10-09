const typingEvents = (socket, io) => {
  // User started typing
  socket.on('typing:start', (data) => {
    socket.to(data.chatId).emit('typing:start', data);
  });

  // User stopped typing
  socket.on('typing:stop', (data) => {
    socket.to(data.chatId).emit('typing:stop', data);
  });
};

module.exports = typingEvents;
