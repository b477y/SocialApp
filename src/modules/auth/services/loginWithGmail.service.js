import { asyncHandler } from "../../../utils/response/error.response.js";
import { OAuth2Client } from "google-auth-library";
import { successResponse } from "../../../utils/response/success.response.js";
import {
  providerTypes,
  roleTypes,
  userModel,
} from "../../../db/models/User.model.js";
import { generateToken } from "../../../utils/security/token.security.js";

const loginWithGmail = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;

  const client = new OAuth2Client();
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.WEB_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  }
  const payload = await verify();

  if (!payload.email_verified) {
    return next(new Error("In-valid account", { cause: 400 }));
  }

  let user = await userModel.findOne({ email: payload.email });
  let statusCode;
  let message;

  if (!user) {
    statusCode = 201;
    message = "Registered & logged in successfully";
    user = await userModel.create({
      username: payload.name,
      email: payload.email,
      confirmEmail: payload.email_verified,
      picture: payload.picture,
      provider: providerTypes.google,
    });
  }

  if (user.provider !== providerTypes.google) {
    return next(new Error("In-valid provider", { cause: 400 }));
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
    message: message || "Logged in successfully",
    status: statusCode || 200,
    data: { TOKEN: { ACCESS_TOKEN, REFRESH_TOKEN }, payload },
  });
});

export default loginWithGmail;
