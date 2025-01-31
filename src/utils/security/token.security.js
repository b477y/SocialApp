import jwt from "jsonwebtoken";

export const generateToken = ({
  payload = {},
  secretKey = parseInt(process.env.USER_ACCESS_TOKEN_SK),
  expiresIn = process.env.EXPIRES_IN,
} = {}) => {
  const token = jwt.sign(payload, secretKey, { expiresIn });
  return token;
};

export const verifyToken = ({
  token,
  secretKey = process.env.USER_ACCESS_TOKEN_SK,
} = {}) => {
  const decoded = jwt.verify(token, secretKey);
  return decoded;
};
