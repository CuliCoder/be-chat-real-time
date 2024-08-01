import * as conversationService from "../services/conversation";
export const get_list_conversation = async (req, res) => {
  try {
    const response = await conversationService.get_list_conversation(
      req.data.id
    );
    if (response.error != 0) {
      return res.status(401).json(response);
    }
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: -2, message: error });
  }
};
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
