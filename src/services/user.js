import { sequelize } from "../config/connection";
import { DataTypes, Op } from "sequelize";
import bcrypt from "bcrypt";
const User = require("../models/user")(sequelize, DataTypes);
const saltRounds = 10;
export const getList = async () => {
  try {
    const users = await User.findAll();
    return users;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
  }
};
const hashPassword = (password) => {
  return bcrypt.hashSync(password, saltRounds);
};
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
        attributes: ["id", "fullname", "email", "tel", "gender"],
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
