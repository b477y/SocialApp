import jwt from "jsonwebtoken";
import * as dbService from "../../db/db.service.js";
import { userModel } from "../../db/models/User.model.js";

export const tokenTypes = {
  access: "access",
  refresh: "refresh",
};

export const generateToken = ({
  payload = {},
  secretKey = parseInt(process.env.USER_ACCESS_TOKEN_SK),
  expiresIn = parseInt(process.env.EXPIRES_IN),
} = {}) => {
  const token = jwt.sign(payload, secretKey, { expiresIn });
  return token;
};

export const verifyToken = ({ token, secretKey } = {}) => {
  const decoded = jwt.verify(token, secretKey);
  return decoded;
};

export const decodeToken = async ({
  authorization = "",
  tokenType = tokenTypes.access,
  next = {},
} = {}) => {
  const [bearer, token] = authorization?.split(" ") || [];

  if (!bearer || !token) {
    return next(new Error("Invalid authorization format", { cause: 401 }));
  }

  let access_signature = "";
  let refresh_signature = "";

  switch (bearer) {
    case "Admin":
      access_signature = process.env.ADMIN_ACCESS_TOKEN_SK;
      refresh_signature = process.env.ADMIN_REFRESH_TOKEN_SK;
      break;

    case "Bearer":
      access_signature = process.env.USER_ACCESS_TOKEN_SK;
      refresh_signature = process.env.USER_REFRESH_TOKEN_SK;
      break;

    default:
      break;
  }

  let decoded = verifyToken({
    token,
    secretKey:
      tokenType === tokenTypes.access ? access_signature : refresh_signature,
  });

  if (!decoded?.id) {
    return next(new Error("In-valid token payload", { cause: 401 })); // 401 => unauthorized account
  }

  const user = await dbService.findOne({
    model: userModel,
    filter: { _id: decoded.id, isDeleted: false },
  });

  if (!user) {
    return next(new Error("Not registered account", { cause: 404 }));
  }

  if (user.changeCredentialsTime?.getTime() >= decoded.iat * 1000) {
    return next(new Error("In-valid login credentials", { cause: 400 }));
  }

  // if (Date.now() / 1000 - decoded.iat > 31536000) {
  //   return next(new Error("Token has expired", { cause: 401 }));
  // }

  return user;
};
