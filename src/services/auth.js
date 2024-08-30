import { sequelize } from "../config/connection";
import { DataTypes, Op } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
require("dotenv").config();
const saltRounds = 10;
const hashPassword = (password) => {
  return bcrypt.hashSync(password, saltRounds);
};
const User = require("../models/user")(sequelize, DataTypes);

export const Login = async (account, password) =>
  new Promise(async (resolve, reject) => {
    try {
      let result = await User.findOne({
        where: { [Op.or]: [{ email: account }, { tel: account }] },
        raw: true,
      });
      const isChecked = result && bcrypt.compareSync(password, result.password);
      const token = isChecked
        ? jwt.sign(
            {
              id: result.id,
              fullname: result.fullname,
              email: result.email,
              tel: result.tel,
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.expiresIn_accessToken }
          )
        : null;
      const refreshtoken = isChecked
        ? jwt.sign(
            {
              id: result.id,
              fullname: result.fullname,
              email: result.email,
              tel: result.tel,
            },
            process.env.refreshToken_SECRET,
            { expiresIn: process.env.expiresIn_refreshToken }
          )
        : null;
      resolve({
        error: token ? 0 : -1,
        id: result.id,
        message: token
          ? { success: "Login success" }
          : { error: "Incorrect email or phone number or password" },
        access_token: token ? "Bearer " + token : null,
        refresh_token: refreshtoken,
      });
    } catch (error) {
      reject(error);
    }
  });
export const refreshToken = async (refresh_token) =>
  new Promise(async (resolve, reject) => {
    try {
      const result = await User.findOne({
        where: { refreshToken: refresh_token },
      });
      if (result) {
        jwt.verify(
          refresh_token,
          process.env.refreshToken_SECRET,
          (err, data) => {
            if (err) resolve({ error: 1, message: "Token is invalid" });
            else {
              const newToken = jwt.sign(
                {
                  id: data.id,
                  fullname: data.fullname,
                  email: data.email,
                  tel: data.tel,
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.expiresIn_accessToken }
              );
              const newRefreshToken = jwt.sign(
                {
                  id: data.id,
                  fullname: data.fullname,
                  email: data.email,
                  tel: data.tel,
                },
                process.env.refreshToken_SECRET,
                { expiresIn: process.env.expiresIn_refreshToken }
              );
              resolve({
                error: newToken && newRefreshToken ? 0 : -1,
                id: data.id,
                message:
                  newToken && newRefreshToken
                    ? "Refresh token success"
                    : "Refresh token fail",
                token:
                  newToken && newRefreshToken
                    ? {
                        access_token: "Bearer " + newToken,
                        refreshToken: newRefreshToken,
                      }
                    : null,
              });
            }
          }
        );
      } else {
        resolve({ error: 1, message: "Token is invalid" });
      }
    } catch (error) {
      reject(error);
    }
  });
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
export const getTokenIo = (data) => {
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
export const updateRefreshToken = (user_id, refreshtoken) =>
  new Promise(async (resolve, reject) => {
    try {
      const result = await User.update(
        { refreshToken: refreshtoken },
        {
          where: {
            id: user_id,
          },
        }
      );
      resolve({
        error: result[0] === 1 ? 0 : -1,
        message:
          result[0] === 1
            ? "update refreshToken success"
            : "update refreshToken failed",
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
