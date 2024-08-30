import { sequelize } from "../config/connection";
import { DataTypes, Op, QueryTypes } from "sequelize";
import { decrypted_message } from "../utils/crypto_mes";
require("dotenv").config();
const Conversation = require("../models/conversation")(sequelize, DataTypes);
export const create_conversation = (user_one, user_two) =>
  new Promise(async (resolve, reject) => {
    try {
      const [conversation, created] = await Conversation.findOrCreate({
        where: {
          [Op.or]: [
            { user_one, user_two },
            { user_one: user_two, user_two: user_one },
          ],
        },
        defaults: {
          user_one,
          user_two,
          status: true,
        },
        raw: true,
      });
      resolve({
        error: created ? 0 : -1,
        message: created
          ? "Create conversation success"
          : "Create conversation failed",
        data: conversation.id,
      });
    } catch (error) {
      reject(error);
    }
  });
export const update_last_message = (
  conversation_id,
  message,
  user_id,
  iv,
  is_seen
) =>
  new Promise(async (resolve, reject) => {
    try {
      const conversation = await Conversation.update(
        {
          last_message: message,
          user_send_last_message: user_id,
          iv,
          is_seen,
        },
        {
          where: {
            id: conversation_id,
          },
        }
      );
      resolve({
        error: conversation[0] === 1 ? 0 : -1,
        message:
          conversation[0] === 1
            ? "Update last message success"
            : "Update last message failed",
      });
    } catch (error) {
      reject(error);
    }
  });
export const get_list_conversations_at_home = (user_id) =>
  new Promise(async (resolve, reject) => {
    try {
      const data = await sequelize.query(
        `SELECT u.id as user_id ,con.user_send_last_message,con.updatedAt,u.fullname,con.last_message,u.avatar,u.gender,con.is_seen as is_seen ,con.iv FROM conversation con,user u WHERE (user_one = ? or user_two = ? ) and con.last_message is not null and u.id != ? and (u.id =user_one or u.id = user_two ) ORDER BY con.updatedAt DESC;`,
        {
          replacements: [user_id, user_id, user_id],
          type: QueryTypes.SELECT,
        }
      );
      const decrypted = data.map((element) => {
        return {
          user_id: element.user_id,
          user_send_last_message: element.user_send_last_message,
          fullname: element.fullname,
          avatar: element.avatar,
          gender: element.gender,
          is_seen: element.is_seen,
          updatedAt: element.updatedAt,
          last_message: decrypted_message(element.last_message, element.iv),
        };
      });
      resolve({
        error: data ? 0 : -1,
        message: data ? "get list success" : "Error",
        data: data ? decrypted : null,
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
