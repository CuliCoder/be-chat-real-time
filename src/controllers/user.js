import * as userService from "../services/user";
export const find_user = async (req, res) => {
  try {
    const response = await userService.find_user(req.data.id,req.query.text);
    if (response.error != 0) {
      return res.status(401).json(response);
    }
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: -2, message: error });
  }
};
export const get_user_by_id = async (req, res) => {
  try {
    const response = await userService.get_user_by_id(req.query.id);
    if (response.error != 0) {
      return res.status(401).json(response);
    }
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: -2, message: error });
  }
}