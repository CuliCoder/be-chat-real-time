import { sequelize } from "../config/connection";
import { DataTypes, Op } from "sequelize";
require("dotenv").config();
const Conversation = require("../models/conversation")(sequelize, DataTypes);
export const get_list_conversation = async (user_id) =>
  new Promise(async (resolve, reject) => {
    try {
      const list_conversation = await Conversation.findAll({
        where: {
          [Op.or]: [{ user_one: user_id }, { user_two: user_id }],
        },
        raw: true,
      });
      resolve({
        error: list_conversation ? 0 : -1,
        message: list_conversation
          ? "Get list conversation success"
          : "Get list conversation failed",
        data: list_conversation,
      });
    } catch (error) {
      reject(error);
    }
  });
export const create_conversation = async (user_one, user_two) =>
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
        data: conversation,
      });
    } catch (error) {
      reject(error);
    }
  });
