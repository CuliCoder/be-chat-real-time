import crypto from "crypto";
const saltRounds = 10;
require("dotenv").config();
export const encrypted_message = (message) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    process.env.algorithm_crypto,
    process.env.key_crypto,
    iv
  );
  let encrypted = cipher.update(message, "utf8", "hex");
  encrypted += cipher.final("hex");
  const base64data = Buffer.from(iv).toString("base64");
  return { encrypted, base64data };
};
export const decrypted_message = (encrypted, iv) => {
  const iv_buffer = Buffer.from(iv, "base64");
  const decipher = crypto.createDecipheriv(
    process.env.algorithm_crypto,
    process.env.key_crypto,
    iv_buffer
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
