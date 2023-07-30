let io;

module.exports = {
  init: (httpServer) => {
    return (io = require('socket.io')(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST'],
      },
    }));
  },

  getIO: () => {
    if (!io) {
      throw new Error('Socket.io is not initialized');
    }
    return io;
  },
};