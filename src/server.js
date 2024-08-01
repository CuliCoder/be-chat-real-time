import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { createServer } from "mysql2";
const initRoute = require("./routes/web");
const initAPIRoute = require("./routes/api");
const authAPIRoute = require("./routes/auth");
const configViewEngine = require("./config/ViewEngine");
const bodyParser = require("body-parser");
const { csrfMiddleware } = require("./middleware/csrf_token");
// const { Server } = require("socket.io");
const SocketService = require("./services/SockerService");
// const connection = require("./config/connection")
// connection()
const cookie = require("cookie");
require("dotenv").config();
const port = process.env.PORT||8080;
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  connectionStateRecovery: {},
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});
global.io = io;

// const server = createServer(app);
// global.io = new Server(server, {
//   connectionStateRecovery: {},
//   cors: {
//     origin: "*",
//   },
// });

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["get", "post", "put", "delete"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
global.io.use((socket, next) => {
  const cookies = socket.request.headers.cookie
    ? socket.request.headers.cookie.split("; ")
    : [];
  let tokenFound = false; // Biến kiểm tra token đã được tìm thấy

  cookies.forEach((element) => {
    const [key, value] = element.split("=");
    if (key === "io_token") {
      tokenFound = true; // Đã tìm thấy token
      console.log("value", value);
      jwt.verify(value, process.env.io_jwt_secret, (err, decoded) => {
        if (err) {
          console.log("err", err);
          return next(new Error("Authentication error"));
        }
        users[socket.id] = decoded.id;
        console.log("decoded", decoded);
        return next(); // Tiếp tục kết nối nếu xác thực thành công
      });
    }
  });

  // Nếu không tìm thấy token, trả về lỗi
  if (!tokenFound) {
    return next(new Error("Authentication error"));
  }
});
global.io.on("connection", SocketService.connection);
configViewEngine(app);
authAPIRoute(app);
app.use(csrfMiddleware);
initRoute(app);
initAPIRoute(app);
http.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
