import { io, Socket } from "socket.io-client";

const SERVER_URL = "http://localhost:5000";

let socket: Socket | null = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(SERVER_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });
  }
  return socket;
};

export const getSocket = () => socket;
