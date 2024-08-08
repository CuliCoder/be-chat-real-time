import * as messageService from "../services/message";
const get_list_conversations_at_home = async (req, res) => {
  try {
    const response = await messageService.get_list_conversations_at_home(
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
const get_all_message_of_conversation = async (req, res) => {
  try {
    console.log(req.body.conversation_id);
    const set_is_seen = await messageService.set_is_seen(
      req.body.conversation_id,
      req.data.id
    );
    if (set_is_seen.error != 0) {
      return res.status(401).json(set_is_seen);
    }
    const response = await messageService.get_all_message_of_conversation(
      req.body.conversation_id,req.data.id
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
module.exports = {
  get_list_conversations_at_home,
  get_all_message_of_conversation,
};
