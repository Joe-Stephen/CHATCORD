const path = require("path");
const express = require("express");
const http = require("http");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const socketio = require("socket.io");
const io = socketio(server);
const PORT = 3000 || process.env.PORT;
//setting the static folder
app.use(express.static(path.join(__dirname, "public")));
const botName = "ChatCord bot";

//run when a client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    //welcome message
    socket.emit("message", formatMessage(botName, "Welcome to ChatCord!"));
    //broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat!`)
      );

    //sending user and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      user: getRoomUsers(user.room),
    });
  });

  //listen to chat messages
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    console.log("New chat message :", msg);
    socket.broadcast
      .to(user.room)
      .emit("message", formatMessage(`${user.username}`, msg));
  });

  //runs when a user disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat.`)
      );
      //sending user and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        user: getRoomUsers(user.room),
      });
    }
  });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
