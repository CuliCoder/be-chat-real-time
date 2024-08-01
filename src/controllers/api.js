import * as services from "../services/user";
import * as login from "../services/auth";
import SocketService from "../services/SockerService";
require("dotenv").config();
const gethomepage = async (req, res) => {
  let results = await services.getList();
  return res.status(200).json({
    data: results,
  });
};
const createUser = async (req, res) => {
  try {
    let { firstname, surname, email, tel, password, gender, DOB } = req.body;
    if (
      !firstname ||
      !surname ||
      (!email && !tel) ||
      !password ||
      !gender ||
      !DOB
    ) {
      return res.status(401).json({
        error: 1,
        message: { error: "Missing information" },
      });
    }
    if (!email) {
      let rgTel = /^(0[1-9]{1}[0-9]{8,9})$/;
      if (!rgTel.test(tel)) {
        return res.status(401).json({
          error: 1,
          message: { emailOrtel: "Mobile phone is invalid" },
        });
      }
    } else {
      let rgEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!rgEmail.test(email)) {
        return res.status(401).json({
          error: 1,
          message: { emailOrtel: "Email address is invalid" },
        });
      }
    }
    let rgPw = /^(?=.*[A-Z])(?=(?:.*\d){8,}).*$/;
    if (!password || !rgPw.test(password)) {
      return res.status(401).json({
        error: 1,
        message: {
          password:
            "Password must start with an uppercase letter and contain at least 8 digits.",
        },
      });
    }
    let today = new Date();
    let date1 = new Date(DOB);
    if (today.getFullYear() - date1.getFullYear() < 16) {
      return res.status(401).json({
        error: 1,
        message: { DOB: "You must be at least 16 years old to register" },
      });
    }
    let result = await services.createUser(
      firstname,
      surname,
      email,
      tel,
      password,
      gender,
      DOB
    );
    if (result)
      return res
        .status(200)
        .json({ error: 0, message: { success: "Sign up success" } });
    return res.status(401).json({
      error: -1,
      message: { emailOrtel: "Email or phone number already exists." },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: -2, message: "error" });
  }
};
const Login = async (req, res) => {
  try {
    let { account, password } = req.body;
    if (!account || !password) {
      return res.status(401).json({
        error: 1,
        message: { error: "Missing information" },
      });
    }
    let rgTel = /^(0[1-9]{1}[0-9]{8,9})$/;
    let rgEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!rgEmail.test(account) && !rgTel.test(account)) {
      return res.status(401).json({
        error: 1,
        message: { emailOrtel: "Email or phone number is invalid" },
      });
    }
    let response = await login.Login(account, password);
    if (response.error != 0) {
      return res.status(401).json(response);
    }
    return res
      .cookie("access_token", response.access_token, {
        httpOnly: true,
        maxAge: Number(process.env.maxAge_accessToken),
        secure: true,
      })
      .cookie("refresh_token", response.refresh_token, {
        httpOnly: true,
        expires: new Date(
          Date.now() + Number(process.env.expires_refreshToken)
        ),
        secure: true,
      })
      .status(200)
      .json({
        error: response.error,
        message: response.message,
      });
  } catch (error) {
    return res.status(500).json({
      error: -2,
      message: error,
    });
  }
};
const refreshToken = async (req, res) => {
  try {
    let refreshToken = req.cookies["refresh_token"];
    if (refreshToken == undefined) {
      return res.status(401).json({
        error: 1,
        message: "Refresh Token is missing",
      });
    }
    let result = await login.refreshToken(refreshToken);
    if (result && result.error != 0) {
      return res.status(401).json(result);
    }
    return res
      .cookie("access_token", result.access_token, {
        httpOnly: true,
        maxAge: Number(process.env.maxAge_accessToken),
        secure: true,
      })
      .status(200)
      .json({
        error: result.error,
        message: result.message,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: -2,
      message: "error",
    });
  }
};
const isLogin = (req, res) => {
  let refreshToken = req.cookies["refresh_token"];
  if (!refreshToken) {
    return res.status(401).json({
      error: 1,
      message: "Refresh Token is missing",
    });
  }
  return res.status(200).json({
    error: 0,
    message: "Token is exist",
  });
};
const getTokenIo =  (req, res) => {
  try {
    const result =  SocketService.getTokenIo(req.data);
    return res
      .cookie("io_token", result, {
        httpOnly: true,
        secure: true,
      })
      .status(200)
      .json({ message: "Token is exist" });
  } catch (error) {
    return res.status(500).json({
      error: -2,
      message: result,
    });
  }
};

module.exports = {
  gethomepage,
  createUser,
  Login,
  refreshToken,
  isLogin,
  getTokenIo,
};
