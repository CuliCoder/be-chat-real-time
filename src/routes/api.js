import * as messages from "../controllers/message";
import * as JWTAction from "../middleware/JWTAction";
import * as conversation from "../controllers/conversation";
import * as user from "../controllers/user";
import * as auth from "../controllers/auth";
import { logout } from "../controllers/logout";
import upload from "../middleware/multer";
const route = require("express").Router();
const initAPIRoute = (app) => {
  route.post("/logout", logout);
  route.use(JWTAction.authenticateToken);
  route.post("/updateprofile", user.update_profile);
  route.post("/uploadAvatar", upload.single("Avatar"), user.uploadAvatar);
  route.get("/is-login", auth.isLogin);
  route.post("/create-conversation", conversation.create_conversation);
  route.get("/find-user", user.find_user);
  route.get("/get-token-io", auth.getTokenIo);
  route.get("/get-user-by-id", user.get_user_by_id);
  route.get("/getmyprofile", user.get_my_profile);
  route.get(
    "/get-list-conversations-at-home",
    conversation.get_list_conversations_at_home
  );
  route.post(
    "/get-all-message-of-conversation",
    messages.get_all_message_of_conversation
  );
  return app.use("/api/v1/", route);
};
module.exports = initAPIRoute;
