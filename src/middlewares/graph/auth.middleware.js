import * as dbService from "../../db/db.service.js";
import { userModel } from "../../db/models/User.model.js";
import {
  verifyToken,
  tokenTypes,
} from "../../utils/security/token.security.js";

export const authentication = async ({
  authorization = "",
  tokenType = tokenTypes.access,
  accessRoles = [],
  checkAuthorization = false,
} = {}) => {
  if (typeof authorization !== "string") {
    throw new Error("Invalid authorization format", { cause: 401 });
  }

  const [bearer, token] = authorization.split(" ");

  if (!bearer || !token) {
    throw new Error("Invalid authorization format", { cause: 401 });
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
    throw new Error("In-valid token payload", { cause: 401 }); // 401 => unauthorized account
  }

  const user = await dbService.findOne({
    model: userModel,
    filter: { _id: decoded.id, isDeleted: false },
  });

  if (!user) {
    throw new Error("Not registered account", { cause: 404 });
  }

  if (user.changeCredentialsTime?.getTime() >= decoded.iat * 1000) {
    throw new Error("In-valid login credentials", { cause: 400 });
  }

  if (checkAuthorization && !accessRoles.includes(user.role)) {
    throw new Error("Unauthorized user", { cause: 403 });
  }
  return user;
};
