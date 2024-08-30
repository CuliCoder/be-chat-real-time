import * as messageService from "../services/message";

export const get_all_message_of_conversation = async (req, res) => {
  try {
    const set_is_seen = await messageService.set_is_seen(
      req.body.conversation_id,
      req.data.id
    );
    if (set_is_seen.error != 0) {
      return res.status(401).json(set_is_seen);
    }
    const response = await messageService.get_all_message_of_conversation(
      req.body.conversation_id,
      req.data.id
    );
    if (response.error != 0) {
      return res.status(401).json(response);
    }
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      error: -2,
      message: error,
    });
  }
};
export const  send_message = async (
  message,
  is_seen,
  deleted_from_sender,
  deleted_from_receiver,
  user_id,
  conversation_id,
  callback
) => {
  try {
    if(message === "") {
      callback();
      return null;
    }
    const response = await messageService.addMessage(
      message,
      is_seen,
      deleted_from_sender,
      deleted_from_receiver,
      user_id,
      conversation_id
    );
    if (response.error != 0) {
      callback();
      return null;
    }
    return response;
  } catch (error) {
    callback();
    return null;
  }
};
