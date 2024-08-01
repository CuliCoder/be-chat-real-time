import * as controllers from "../controllers/api";
import * as auth from "../controllers/auth";
const AuthRoute = require("express").Router();
const authAPIRoute = (app) => {
  AuthRoute.post("/login", controllers.Login);
  AuthRoute.post("/refresh-token", controllers.refreshToken);
  AuthRoute.post("/create-user", controllers.createUser);
  AuthRoute.get("/is-login", controllers.isLogin);
  AuthRoute.get("/get-csrf", auth.get_csrf_token);
  return app.use("/api/v1/", AuthRoute);
};
module.exports = authAPIRoute;
