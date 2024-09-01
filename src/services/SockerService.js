import { get_list_conversations_at_home_socket } from "../controllers/conversation";
import { send_message } from "../controllers/message";
import { update_last_message } from "../controllers/conversation";
global.users = {};
class SocketService {
  connection = (socket) => {
    //check user id exist
    const existingUser = Object.keys(global.users).filter(
      (key) => global.users[key] === global.users[socket.id]
    );
    if (existingUser.length > 1) {
      console.log("User already connected", existingUser);
      existingUser.forEach((value) => {
        global.io.to(value).emit("account logged in another device");
      });
    }
    // set current conversation
    let current_conversation = {
      conversation_id: null,
      user_two: null,
    };
    console.log("a user connected");
    // event send message
    socket.on("send message", async (fullname, message) => {
      if (message === "" || message === null) return;
      const targetsocket = this.findTargetSocketId(
        current_conversation.user_two
      );
      const conversation_id = current_conversation.conversation_id;
      const isInRoom = this.IsInRoom(targetsocket, conversation_id);
      const is_seen = isInRoom ? true : false;
      const send_msg_result = await this.send_message(
        message,
        is_seen,
        false,
        false,
        global.users[socket.id],
        conversation_id
      );
      if (send_msg_result === null) return;
      // event update last message
      const update_last_message_result = await update_last_message(
        send_msg_result.data.conversation_id,
        send_msg_result.data.message,
        send_msg_result.data.user_id,
        send_msg_result.data.iv,
        send_msg_result.data.is_seen
      );
      if (update_last_message_result === null) return;
      // event update list conversation at home
      await this.updateListConversationAtHome(socket.id);
      if (targetsocket === undefined) {
        return;
      }
      if (!isInRoom) {
        global.io.to(targetsocket).emit("notification", fullname, message);
      }
      await this.updateListConversationAtHome(targetsocket);
    });
    // event join room
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
    // event leave room
    socket.on("leave room", () => {
      if (current_conversation.conversation_id !== null) {
        socket.leave(current_conversation.conversation_id);
        current_conversation = {
          conversation_id: null,
          user_two: null,
        };
      }
    });
    // event disconnect
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
    const result = await get_list_conversations_at_home_socket(
      global.users[socketID],
      () => {
        console.log("Get list conversations at home failed");
        global.io
          .to(socketID)
          .emit("error", "Get list conversations at home failed");
        return;
      }
    );
    if (result.data !== null) {
      global.io
        .to(socketID)
        .emit("get list conversations at home", result.data);
    }
  };

  send_message = async (
    message,
    is_seen,
    deleted_from_sender,
    deleted_from_receiver,
    user_id,
    conversation_id
  ) => {
    const result = await send_message(
      message,
      is_seen,
      deleted_from_sender,
      deleted_from_receiver,
      user_id,
      conversation_id,
      () => {
        console.log("Message not added");
        global.io.to(socket.id).emit("error", "Message not added");
        return null;
      }
    );
    if (result === null) {
      return null;
    }
    console.log("Message added", result.data);
    global.io.to(conversation_id).emit("receive message", {
      message,
      is_seen: result.data.is_seen,
      user_id: result.data.user_id,
      id: result.data.id,
    });
    return result;
  };

  update_last_message = async (
    conversation_id,
    message,
    user_id,
    iv,
    is_seen
  ) => {
    const response = await update_last_message(
      conversation_id,
      message,
      user_id,
      iv,
      is_seen,
      () => {
        console.log("Update last message failed");
        global.io.to(socket.id).emit("error", "Update last message failed");
        return null;
      }
    );
    if (response === null) {
      return null;
    }
    console.log("Update last message success");
  };
  IsInRoom = (socketID, conversation_id) => {
    if (conversation_id === null) return false;
    const room = io.sockets.adapter.rooms.get(conversation_id);
    return room ? room.has(socketID) : false;
  };

  
}
module.exports = new SocketService();
