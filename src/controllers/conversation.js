import * as conversationService from "../services/conversation";
export const create_conversation = async (req, res) => {
  try {
    const response = await conversationService.create_conversation(
      req.data.id,
      req.body.user_two
    );
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: -2, message: error });
  }
};
export const update_last_message = async (
  conversation_id,
  message,
  user_id,
  iv,
  is_seen,
  callback
) => {
  try {
    const response = await conversationService.update_last_message(
      conversation_id,
      message,
      user_id,
      iv,
      is_seen
    );
    if (response.error != 0) {
      callback();
      return null;
    }
    return response;
  } catch (error) {
    console.log(error);
    callback();
    return null;
  }
};
export const get_list_conversations_at_home = async (req, res) => {
  try {
    const response = await conversationService.get_list_conversations_at_home(
      req.data.id
    );
    if (response.error != 0) {
      return res.status(401).json(response);
    }
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: -2,
      message: error,
    });
  }
};
export const get_list_conversations_at_home_socket = async (
  user_id,
  callback
) => {
  try {
    const response = await conversationService.get_list_conversations_at_home(
      user_id
    );
    if (response.error != 0) {
      callback();
      return null;
    }
    return response;
  } catch (error) {
    console.log(error);
    callback();
    return null;
  }
};
