import { sequelize } from "../config/connection";
import { DataTypes, Op } from "sequelize";
const User = require("../models/user")(sequelize, DataTypes);
export const createUser = async (
  firstname,
  surname,
  email,
  tel,
  password,
  gender,
  DOB
) => {
  try {
    let fullname = firstname + " " + surname;
    console.log(firstname, surname, fullname);
    const [user, created] = await User.findOrCreate({
      where: {
        email,
        tel,
      },
      defaults: {
        fullname,
        email,
        tel,
        password: hashPassword(password),
        gender,
        DOB,
        refreshToken: null,
      },
    });
    return created;
  } catch (error) {
    console.log(error);
    return false;
  }
};
export const find_user = (id, text) =>
  new Promise(async (resolve, reject) => {
    try {
      const user = await User.findAll({
        where: {
          [Op.not]: [{ id: id }],
          [Op.or]: [
            { fullname: { [Op.like]: `%${text}%` } },
            { email: { [Op.like]: `%${text}%` } },
            { tel: { [Op.like]: `%${text}%` } },
          ],
        },
        attributes: ["id", "fullname", "gender", "avatar"],
        raw: true,
      });
      resolve({
        error: user ? 0 : -1,
        message: user ? "User found" : "User not found",
        data: user,
      });
    } catch (error) {
      reject(error);
    }
  });
export const get_user_by_id = (id) =>
  new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne({
        where: {
          id: id,
        },
        attributes: ["id", "fullname", "gender", "avatar"],
        raw: true,
      });
      resolve({
        error: user ? 0 : -1,
        message: user ? "User found" : "User not found",
        data: user,
      });
    } catch (error) {
      reject(error);
    }
  });
export const get_my_profile = (id) =>
  new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne({
        where: {
          id: id,
        },
        attributes: [
          "id",
          "fullname",
          "email",
          "tel",
          "DOB",
          "gender",
          "avatar",
        ],
        raw: true,
      });
      resolve({
        error: user ? 0 : -1,
        message: user ? "User found" : "User not found",
        data: user,
      });
    } catch (error) {
      reject(error);
    }
  });
export const uploadAvatar = (id, avatar) =>
  new Promise(async (resolve, reject) => {
    try {
      const user = await User.update(
        { avatar },
        {
          where: {
            id,
          },
        }
      );
      resolve({
        error: user[0] === 1 ? 0 : -1,
        message: user[0] ? "update avatar success" : "update avatar failed",
      });
    } catch (error) {
      reject(error);
    }
  });
export const updateProfile = (id, fullname, gender, DOB) =>
  new Promise(async (resolve, reject) => {
    try {
      const user = await User.update(
        { fullname, gender, DOB },
        {
          where: {
            id,
          },
        }
      );
      resolve({
        error: user[0] === 1 ? 0 : -1,
        message: user[0]
          ? { success: "update information success" }
          : { error: "update information failed" },
      });
    } catch (error) {
      reject(error);
    }
  });

