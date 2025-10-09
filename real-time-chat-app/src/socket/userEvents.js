const userEvents = (socket, io) => {
  // User joins
  socket.on('user:join', (data) => {
    socket.join(data.userId);
    console.log(`User ${data.userId} joined`);
  });

  // User status update
  socket.on('user:status', (data) => {
    // Broadcast status to contacts
    socket.to(data.userId).emit('user:status', data);
  });
};

module.exports = userEvents;
