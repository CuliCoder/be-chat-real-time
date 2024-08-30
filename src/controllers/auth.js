import * as auth from "../services/auth";
export const get_csrf_token = (req, res) => {
  const csrfToken = req.cookies._csrf;
  if (!csrfToken) {
    return res.status(403).json({
      error: 1,
      message: "Invalid CSRF token",
    });
  }
  return res.status(200).json({
    error: 0,
    csrfToken,
  });
};
export const createUser = async (req, res) => {
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
    let rgName = /[^a-zA-Z0-9À-ỹ\s]/;
    if (rgName.test(firstname)) {
      return res.status(401).json({
        error: 1,
        message: { firstname: "First name is invalid" },
      });
    }
    if (rgName.test(surname)) {
      return res.status(401).json({
        error: 1,
        message: { surname: "Surname is invalid" },
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
    let result = await auth.createUser(
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
export const Login = async (req, res) => {
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
    let response = await auth.Login(account, password);
    if (response.error != 0) {
      return res.status(401).json(response);
    }
    const updateRefreshToken = await auth.updateRefreshToken(response.id,response.refresh_token);
    if (updateRefreshToken.error != 0) {
      return res.status(401).json(updateRefreshToken);
    }
    return res
      .cookie("access_token", response.access_token, {
        httpOnly: true,
        maxAge: Number(process.env.maxAge_accessToken),
        secure: true,
        sameSite: "None",
      })
      .cookie("refresh_token", response.refresh_token, {
        httpOnly: true,
        expires: new Date(
          Date.now() + Number(process.env.expires_refreshToken)
        ),
        secure: true,
        sameSite: "None",
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
export const refreshToken = async (req, res) => {
  try {
    let refreshToken = req.cookies["refresh_token"];
    if (refreshToken == undefined) {
      return res.status(401).json({
        error: 1,
        message: "Refresh Token is missing",
      });
    }
    let result = await auth.refreshToken(refreshToken);
    if (result && result.error != 0) {
      return res.status(401).json(result);
    }
    let updateRefreshToken = await auth.updateRefreshToken(result.id,result.token.refreshToken);
    if (updateRefreshToken.error != 0) {
      return res.status(401).json(updateRefreshToken);
    }
    return res
      .cookie("access_token", result.token.access_token, {
        httpOnly: true,
        maxAge: Number(process.env.maxAge_accessToken),
        secure: true,
        sameSite: "None",
      })
      .cookie("refresh_token", result.token.refreshToken, {
        httpOnly: true,
        expires: new Date(
          Date.now() + Number(process.env.expires_refreshToken)
        ),
        secure: true,
        sameSite: "None",
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
export const isLogin = (req, res) => {
  try {
    if (!req.data)
      return res.status(401).json({
        error: 1,
        message: "Token is invalid",
      });
    return res.status(200).json(req.data);
  } catch (error) {
    return res.status(500).json({
      err: -2,
      message: error,
    });
  }
};
export const getTokenIo = (req, res) => {
  try {
    const result = auth.getTokenIo(req.data);
    return res
      .cookie("io_token", result, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
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
