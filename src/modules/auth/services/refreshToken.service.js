import { roleTypes, userModel } from "../../../db/models/User.model.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { generateToken } from "../../../utils/security/token.security.js";
import {
  decodeToken,
  tokenTypes,
} from "../../../utils/security/token.security.js";

const refreshToken = asyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return next(new Error("Authorization header is required", { cause: 401 }));
  }

  const user = await decodeToken({
    authorization,
    tokenType: tokenTypes.refresh,
    next,
  });

  const ACCESS_TOKEN = generateToken({
    payload: { id: user._id },
    secretKey:
      user.role === roleTypes.admin
        ? process.env.ADMIN_ACCESS_TOKEN_SK
        : process.env.USER_ACCESS_TOKEN_SK,
  });

  const REFRESH_TOKEN = generateToken({
    payload: { id: user._id },
    secretKey:
      user.role === roleTypes.admin
        ? process.env.ADMIN_REFRESH_TOKEN_SK
        : process.env.USER_REFRESH_TOKEN_SK,
    expiresIn: 31536000,
  });

  return successResponse({
    res,
    status: 200,
    message: "Tokens refreshed successfully",
    data: { Tokens: { ACCESS_TOKEN, REFRESH_TOKEN } },
  });
});

export default refreshToken;
