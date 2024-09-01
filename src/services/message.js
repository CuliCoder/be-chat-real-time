import { sequelize } from "../config/connection";
import { DataTypes, Op } from "sequelize";
require("dotenv").config();
const Message = require("../models/message")(sequelize, DataTypes);
import { encrypted_message, decrypted_message } from "../utils/crypto_mes";
export const addMessage = (
  message,
  is_seen,
  deleted_from_sender,
  deleted_from_receiver,
  user_id,
  conversation_id
) =>
  new Promise(async (resolve, reject) => {
    try {
      const { encrypted, base64data } = encrypted_message(message);
      const newMessage = await Message.create({
        message: encrypted,
        is_seen,
        deleted_from_sender,
        deleted_from_receiver,
        user_id,
        conversation_id,
        iv: base64data,
      });
      resolve({
        error: newMessage ? 0 : -1,
        message: newMessage ? "Message added" : "Error",
        data: newMessage ? newMessage : null,
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
export const set_is_seen = (conversation_id, user_id) =>
  new Promise((resolve, reject) => {
    try {
      const messages = Message.update(
        { is_seen: true },
        {
          where: {
            conversation_id,
            is_seen: false,
            [Op.not]: [{ user_id }],
          },
        }
      );
      resolve({
        error: messages ? 0 : -1,
        message: messages ? "Messages updated" : "Error",
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
export const get_all_message_of_conversation = (conversation_id, user_id) =>
  new Promise(async (resolve, reject) => {
    try {
      const data = await Message.findAll({
        where: { conversation_id },
        raw: true,
      });
      const decrypted = data.map((element) => {
        return {
          ...element,
          message: decrypted_message(element.message, element.iv),
        };
      });
      resolve({
        error: data ? 0 : -1,
        message: data ? "Messages found" : "Error",
        data: data ? { messages: decrypted, user_id } : null,
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
