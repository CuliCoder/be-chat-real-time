import * as controllers from "../controllers/api";
const AuthRoute = require("express").Router();
const authAPIRoute = (app) => {
  AuthRoute.post("/login", controllers.Login);
  AuthRoute.post("/refresh-token", controllers.refreshToken);
  AuthRoute.post("/create-user", controllers.createUser);
  AuthRoute.get("/is-login", controllers.isLogin);
  return app.use("/api/v1/", AuthRoute);
};
module.exports = authAPIRoute;
