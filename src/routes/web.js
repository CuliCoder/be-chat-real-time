import express from "express";
import controllers from "../controllers/web.js";
const route = express.Router();
const initRoute = (app) => {
  app.get("/", controllers.gethomepage);
  return app.use("/", route);
};
module.exports = initRoute ;
