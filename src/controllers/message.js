import * as messageService from "../services/message";
const sendMessage = async (req, res) => {
  let data = messageService.sendMessage(
    req.body.message,
    req.params.idRoom,
    // req.token
  );
  console.log(data);
  return res.status(200).json(data);
};
const joinRoom = (req, res) => {
  let data = messageService.joinRoom(req.params.idRoom);
  console.log(data);
  return res.status(200).json(data);
};
module.exports = { sendMessage, joinRoom };
