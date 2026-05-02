import { io } from "socket.io-client";

export const createSocket = (token) => {
  return io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
    transports: ["websocket"],
    auth: {
      token,
    },
  });
};

export default createSocket;
