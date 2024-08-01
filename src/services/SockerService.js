import jwt from "jsonwebtoken";
import {
  addMessage,
  set_is_seen,
  get_new_message_of_list_conversation,
  get_all_message_of_conversation,
} from "./message";
import user from "../models/user";
global.users = {};
class SocketService {
  connection(socket) {
    console.log("a user connected");
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
    socket.on("send message", async ({ message, conversation_data }) => {
      console.log("message: " + message);
      const targetsocket = Object.keys(global.users).find(
        (key) => global.users[key] === conversation_data.user_two
      );
      const conversation_id = conversation_data.conversation_id;
      const isInRoom = io.sockets.adapter.rooms
        .get(conversation_id)
        .has(targetsocket);
      console.log("isInRoom", isInRoom);
      console.log("has user", io.sockets.adapter.rooms.has(3));
      console.log("list user", io.sockets.adapter.rooms);
      console.log("rooms", io.sockets.sockets.get(socket.id).rooms);
      const is_seen = isInRoom ? true : false;
      const result = await addMessage(
        message,
        is_seen,
        false,
        false,
        global.users[socket.id],
        conversation_data.conversation_id
      );
      if (result.error === -1) {
        console.log("Message not added");
        return;
      }
      console.log("Message added", result.data);
      global.io
        .to(conversation_data.conversation_id)
        .emit("receive message", { ...result.data, socketID: socket.id });
      if (!isInRoom) {
        global.io.to(targetsocket).emit("notification", message);
      }
    });
    socket.on("room", async (room) => {
      let current_room;
      io.sockets.sockets.get(socket.id).rooms.forEach((element) => {
        if (element !== socket.id) {
          current_room = element;
        }
      });
      if (current_room === room) {
        return;
      }
      if (current_room !== undefined) {
        socket.leave(current_room);
      }
      socket.join(room);
      await set_is_seen(room, global.users[socket.id]);
      const messages = await get_all_message_of_conversation(room);
      console.log("messages", messages);
      if (messages.data !== null) {
        global.io
          .to(socket.id)
          .emit(
            "load all message in room",
            messages.data,
            global.users[socket.id]
          );
      }
    });
    socket.on("disconnect", () => {
      console.log("user disconnected");
      delete users[socket.id];
    });
    socket.on("get new message of list conversation", async () => {
      const data = await get_new_message_of_list_conversation(
        global.users[socket.id]
      );
      if (data.data !== null) {
        global.io
          .to(socket.id)
          .emit("get new message of list conversation", data.data);
      }
    });
  }
  getTokenIo = (data) => {
    return jwt.sign(
      {
        id: data.id,
        fullname: data.fullname,
        email: data.email,
        tel: data.tel,
      },
      process.env.io_jwt_secret
    );
  };
}
module.exports = new SocketService();
