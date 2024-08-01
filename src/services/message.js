import { sequelize } from "../config/connection";
import { DataTypes, Op, QueryTypes } from "sequelize";
import { get_user_by_id } from "./user";
require("dotenv").config();
const Message = require("../models/message")(sequelize, DataTypes);
const conversation = require("../models/conversation")(sequelize, DataTypes);
const User = require("../models/user")(sequelize, DataTypes);
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
      let data;
      if (newMessage) {
        const decrypted = decrypted_message(newMessage.message, newMessage.iv);
        data = {
          ...newMessage.dataValues,
          message: decrypted,
        };
      }
      resolve({
        error: newMessage ? 0 : -1,
        message: newMessage ? "Message added" : "Error",
        data: newMessage ? data : null,
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
export const get_new_message_of_list_conversation = (user_id) =>
  new Promise(async (resolve, reject) => {
    try {
      const data = await sequelize.query(
        `
        SELECT mes.id AS message_id,
        mes.message,
        mes.is_seen,
        mes.user_id AS message_user_id,
        mes.createdAt AS message_created_at,
        mes.updatedAt AS message_updated_at,
        mes.iv,
        mes.conversation_id,
        con.user_one,
        con.user_two,
        u.fullname as remaining_user_fullname,
        u.id as remaining_user_id
        FROM messages mes
        JOIN conversation con ON mes.conversation_id = con.id
        JOIN user u on u.id != ? and (u.id = con.user_one or u.id = con.user_two)
        WHERE (con.user_one =?  OR con.user_two =?)
        AND mes.createdAt = (
          SELECT MAX(mes2.createdAt)
          FROM messages mes2
          WHERE mes2.conversation_id = mes.conversation_id
        )
        ORDER BY mes.createdAt DESC;
      `,
        {
          replacements: [user_id, user_id, user_id],
          type: QueryTypes.SELECT,
        }
      );
      const decrypted = data.map((element) => {
        return {
          ...element,
          message: decrypted_message(element.message, element.iv),
        };
      });
      resolve({
        error: data ? 0 : -1,
        message: data ? "Messages found" : "Error",
        data: data ? decrypted : null,
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
export const get_all_message_of_conversation = (conversation_id) =>
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
        data: data ? decrypted : null,
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
