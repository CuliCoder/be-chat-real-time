import { sequelize } from "../config/connection";
import { DataTypes, Op } from "sequelize";
import bcrypt from "bcrypt";
// import db from "../models/index";
import jwt from "jsonwebtoken";
require("dotenv").config();

const User = require("../models/user")(sequelize, DataTypes);

const Login = async (account, password) =>
  new Promise(async (resolve, reject) => {
    try {
      let result = await User.findOne({
        where: { [Op.or]: [{ email: account }, { tel: account }] },
        raw: true,
      });
      const isChecked = result && bcrypt.compareSync(password, result.password);
      console.log("result:", result);
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
        message: token
          ? { success: "Login success" }
          : { error: "Incorrect email or phone number or password" },
        access_token: token ? "Bearer " + token : null,
        refresh_token: refreshtoken,
      });
      if (refreshtoken) {
        await User.update(
          { refreshToken: refreshtoken },
          {
            where: {
              id: result.id,
            },
          }
        );
      }
    } catch (error) {
      reject(error);
    }
  });
const refreshToken = async (refresh_token) =>
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
              resolve({
                error: newToken ? 0 : -1,
                message: newToken
                  ? "Refresh token success"
                  : "Refresh token fail",
                access_token: newToken ? "Bearer " + newToken : null,
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
module.exports = { Login, refreshToken };
