import { asyncHandler } from "../../../utils/response/error.response.js";
import { compareHash } from "../../../utils/security/hash.security.js";
import {
  providerTypes,
  roleTypes,
  userModel,
} from "../../../db/models/User.model.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { generateToken } from "../../../utils/security/token.security.js";
import * as dbService from "../../../db/db.service.js";

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await dbService.findOne({
    model: userModel,
    filter: { email, provider: providerTypes.system },
  });

  if (!user) {
    return next(Error("User doesn't exist", { cause: 404 }));
  }

  if (!user.confirmEmail) {
    return next(Error("Please verify your email first", { cause: 404 }));
  }

  if (!compareHash({ plaintext: password, encryptedText: user.password })) {
    return next(Error("In-valid credentials", { cause: 404 }));
  }

  const ACCESS_TOKEN = generateToken({
    payload: { id: user._id },
    secretKey: [roleTypes.admin, roleTypes.superAdmin].includes(user.role)
      ? process.env.ADMIN_ACCESS_TOKEN_SK
      : process.env.USER_ACCESS_TOKEN_SK,
  });

  const REFRESH_TOKEN = generateToken({
    payload: { id: user._id },
    secretKey: [roleTypes.admin, roleTypes.superAdmin].includes(user.role)
      ? process.env.ADMIN_REFRESH_TOKEN_SK
      : process.env.USER_REFRESH_TOKEN_SK,
    expiresIn: 31536000,
  });

  return successResponse({
    res,
    status: 200,
    message: "Logged in successfully",
    data: { Tokens: { ACCESS_TOKEN, REFRESH_TOKEN } },
  });
});

export default login;
