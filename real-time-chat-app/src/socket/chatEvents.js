const chatEvents = (socket, io) => {
  // Join chat room
  socket.on('chat:join', (data) => {
    socket.join(data.chatId);
    console.log(`User joined chat ${data.chatId}`);
  });

  // Leave chat room
  socket.on('chat:leave', (data) => {
    socket.leave(data.chatId);
    console.log(`User left chat ${data.chatId}`);
  });
};

module.exports = chatEvents;
