import * as controllers from "../controllers/api";
import * as messages from "../controllers/message";
import * as JWTAction from "../middleware/JWTAction";
import * as conversation from "../controllers/conversation";
import * as user from "../controllers/user";
const route = require("express").Router();
const initAPIRoute = (app) => {
  route.use(JWTAction.authenticateToken);
  route.get("/", controllers.gethomepage);
  route.post("/message/:idRoom/send", messages.sendMessage);
  route.get("/message/:idRoom", messages.joinRoom);
  route.get("/get-list-conversation", conversation.get_list_conversation);
  route.post("/create-conversation", conversation.create_conversation);
  route.get("/find-user", user.find_user);
  route.get("/get-token-io", controllers.getTokenIo);
  route.get("/get-user-by-id", user.get_user_by_id);
  return app.use("/api/v1/", route);
};
module.exports = initAPIRoute;
