const initSocket = (io) => {
  io.on("connection", (socket) => {
    socket.emit("connected", { message: "Socket connected" });

    socket.on("join-project", (projectId) => {
      socket.join(`project:${projectId}`);
    });

    socket.on("leave-project", (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    socket.on("disconnect", () => {
      // no-op for now
    });
  });
};

module.exports = initSocket;
