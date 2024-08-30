export const logout = async (req, res) => {
  try {
    Object.keys(req.cookies).forEach((key) => {
      res.clearCookie(key, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      });
    });
    return res.status(200).json({
      error: 0,
      message: "Logout success",
    });
  } catch (error) {
    return res.status(500).json({
      error: -2,
      message: "error",
    });
  }
};
