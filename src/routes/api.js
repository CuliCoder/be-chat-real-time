import * as controllers from "../controllers/api";
import * as messages from "../controllers/message";
import * as JWTAction from "../middleware/JWTAction";
import * as conversation from "../controllers/conversation";
import * as user from "../controllers/user";
import { logout } from "../controllers/logout";
const route = require("express").Router();
const initAPIRoute = (app) => {
  route.post("/logout",logout)
  route.use(JWTAction.authenticateToken);
  route.get("/", controllers.gethomepage);
  route.get("/is-login", controllers.isLogin);
  route.get("/get-list-conversation", conversation.get_list_conversation);
  route.post("/create-conversation", conversation.create_conversation);
  route.get("/find-user", user.find_user);
  route.get("/get-token-io", controllers.getTokenIo);
  route.get("/get-user-by-id", user.get_user_by_id);
  route.get("/get-list-conversations-at-home", messages.get_list_conversations_at_home);
  route.post("/get-all-message-of-conversation", messages.get_all_message_of_conversation);
  return app.use("/api/v1/", route);
};
module.exports = initAPIRoute;
