import { createServer } from 'http';
import { Server } from 'socket.io';
import { createApp } from './app';
import { isOriginAllowed } from './middleware/corsConfig';
import { setSocketManager } from './services/socketService';
import { SocketManager } from './utils/socketManager';

const app = createApp();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || isOriginAllowed(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS policy'));
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const socketManagerInstance = new SocketManager(io);
setSocketManager(socketManagerInstance);
export { socketManagerInstance as socketManager };

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server ready for connections`);
});
