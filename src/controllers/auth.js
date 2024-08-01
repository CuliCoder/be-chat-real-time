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
