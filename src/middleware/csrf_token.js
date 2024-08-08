import crypto from "crypto";
require("dotenv").config();
export const csrfMiddleware = (req, res, next) => {
  // Xác thực yêu cầu POST, PUT, DELETE
  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    const tokenFromClient = req.headers["x-csrf-token"] || req.body._csrf;
    const tokenFromCookie = req.cookies._csrf;
    if (!tokenFromCookie || tokenFromClient !== tokenFromCookie) {
      return res.status(403).send("Invalid CSRF token");
    }
  }

  // Tạo và gửi CSRF token cho các yêu cầu GET
  if (req.method === "GET") {
    const csrfToken = crypto.randomBytes(32).toString("hex");
    res.cookie("_csrf", csrfToken, {
      sameSite: "None",
      secure: true, // Hoặc 'Lax', tùy thuộc vào yêu cầu của bạn
      httpOnly: true,
    });
    res.locals.csrfToken = csrfToken; // Để có thể gửi token trong response nếu cần
  }

  next();
};
