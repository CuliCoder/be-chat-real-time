import * as auth from "../controllers/auth";
const AuthRoute = require("express").Router();
const authAPIRoute = (app) => {
  AuthRoute.post("/login", auth.Login);
  AuthRoute.post("/refresh-token", auth.refreshToken);
  AuthRoute.post("/create-user", auth.createUser);
  AuthRoute.get("/get-csrf", auth.get_csrf_token);
  return app.use("/api/v1/", AuthRoute);
};
module.exports = authAPIRoute;
