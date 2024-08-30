import * as userService from "../services/user";
export const find_user = async (req, res) => {
  try {
    const response = await userService.find_user(req.data.id, req.query.text);
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
};
export const uploadAvatar = async (req, res) => {
  try {
    console.log(req.file);
    const response = await userService.uploadAvatar(
      req.data.id,
      req.file.filename
    );
    if (response.error != 0) {
      return res.status(401).json(response);
    }
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: -2, message: error });
  }
};
export const get_my_profile = async (req, res) => {
  try {
    const response = await userService.get_my_profile(req.data.id);
    if (response.error != 0) {
      return res.status(401).json(response);
    }
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: -2, message: error });
  }
};
export const update_profile = async (req, res) => {
  try {
    const { fullname, gender, DOB } = req.body;
    if (!fullname || !gender || !DOB) {
      return res
        .status(400)
        .json({ error: -1, message: { error: "missing field" } });
    }
    let today = new Date();
    let date1 = new Date(DOB);
    if (today.getFullYear() - date1.getFullYear() < 16) {
      return res.status(401).json({
        error: 1,
        message: { DOB: "You must be at least 16 years old to register" },
      });
    }
    const response = await userService.updateProfile(
      req.data.id,
      fullname,
      gender,
      DOB
    );
    if (response.error != 0) {
      return res.status(401).json(response);
    }
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: -2, message: { error: "some error" } });
  }
};
