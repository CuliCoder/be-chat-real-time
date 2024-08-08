import jwt from "jsonwebtoken";
import { addMessage, get_list_conversations_at_home } from "./message";
global.users = {};
class SocketService {
  connection = (socket) => {
    let current_conversation = {
      conversation_id: null,
      user_two: null,
    };
    console.log("a user connected");
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
    socket.on("send message", async (message) => {
      console.log("message: " + current_conversation.conversation_id);
      const targetsocket = this.findTargetSocketId(
        current_conversation.user_two
      );
      const conversation_id = current_conversation.conversation_id;
      const isInRoom = this.IsInRoom(targetsocket, conversation_id);
      const is_seen = isInRoom ? true : false;
      const result = await addMessage(
        message,
        is_seen,
        false,
        false,
        global.users[socket.id],
        current_conversation.conversation_id
      );
      if (result.error === -1) {
        console.log("Message not added");
        return;
      }
      console.log("Message added", result.data);
      global.io
        .to(current_conversation.conversation_id)
        .emit("receive message", { ...result.data, socketID: socket.id });
      await this.updateListConversationAtHome(socket.id);
      if (targetsocket === undefined) {
        return;
      }
      if (!isInRoom) {
        global.io.to(targetsocket).emit("notification", message);
      }
      await this.updateListConversationAtHome(targetsocket);
    });
    socket.on("room", (conversation) => {
      if (
        current_conversation.conversation_id === conversation.conversation_id
      ) {
        return;
      }
      if (current_conversation.conversation_id !== null) {
        socket.leave(current_conversation.conversation_id);
      }
      current_conversation = conversation;
      socket.join(conversation.conversation_id);
    });
    socket.on("disconnect", () => {
      console.log("user disconnected");
      delete global.users[socket.id];
    });
  };
  findTargetSocketId = (userId) => {
    return Object.keys(global.users).find(
      (key) => global.users[key] === userId
    );
  };
  updateListConversationAtHome = async (socketID) => {
    const result = await get_list_conversations_at_home(global.users[socketID]);
    if (result.data !== null) {
      global.io
        .to(socketID)
        .emit("get list conversations at home", result.data);
    }
  };
  IsInRoom = (socketID, conversation_id) => {
    const room = io.sockets.adapter.rooms.get(conversation_id);
    return room ? room.has(socketID) : false;
  };
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
