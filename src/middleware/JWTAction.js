import jwt, { TokenExpiredError } from "jsonwebtoken";
require("dotenv").config();

export const authenticateToken = (req, res, next) => {
  const token = req.cookies["access_token"];
  if (token == null)
  {
    return res.status(401).send({ error: 1, message: "Token is missing" });
  }
  const access_token = token.split(" ")[1];
  jwt.verify(access_token, process.env.JWT_SECRET, (err, data) => {
    if (err instanceof TokenExpiredError)
    {
      return res.status(401).send({ error: 1, message: "Token is expired" });
    }
    if (err)
    {
      return res.status(401).send({ error: 2, message: "Token is invalid" });
    }
    req.data = data;
    next();
  });
};

