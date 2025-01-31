import { roleTypes, userModel } from "../../../db/models/User.model.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import {
  generateToken,
  verifyToken,
} from "../../../utils/security/token.security.js";

const refreshToken = asyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return next(new Error("Authorization header is required", { cause: 401 }));
  }
  
  const [bearer, token] = authorization?.split(" ") || [];

  if (!bearer || !token) {
    return next(new Error("Invalid authorization format", { cause: 401 }));
  }

  let secretKey = "";

  switch (bearer) {
    case "Admin":
      secretKey = process.env.ADMIN_REFRESH_TOKEN_SK;
      break;

    case "Bearer":
      secretKey = process.env.USER_REFRESH_TOKEN_SK;
      break;

    default:
      break;
  }

  let decoded = verifyToken({ token, secretKey });

  if (!decoded?.id) {
    return next(new Error("In-valid token payload", { cause: 401 })); // 401 => unauthorized account
  }

  const user = await userModel.findOne({ _id: decoded.id, isDeleted: false });

  if (!user) {
    return next(new Error("Not registered account", { cause: 404 }));
  }

  if (user.changeCredentialsTime?.getTime() >= decoded.iat * 1000) {
    return next(new Error("In-valid login credentials", { cause: 400 }));
  }

  if (Date.now() / 1000 - decoded.iat > 31536000) {
    return next(new Error("Token has expired", { cause: 401 }));
  }

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
    message: "Logged in successfully",
    data: { token: { ACCESS_TOKEN, REFRESH_TOKEN } },
  });
});

export default refreshToken;
