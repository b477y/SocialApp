import { userModel } from "../../../db/models/User.model.js";
import { emailEvent } from "../../../utils/events/email.event.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import {
  compareHash,
  generateHash,
} from "../../../utils/security/hash.security.js";
import * as dbService from "../../../db/db.service.js";

const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, OTP, password, confirmationPassword } = req.body;

  if (!email) {
    return next(
      new Error("In-valid email address, please write a valid email", {
        cause: 401,
      })
    );
  }

  if (!OTP) {
    return next(
      new Error("OTP is required", {
        cause: 401,
      })
    );
  }

  if (!password) {
    return next(
      new Error("New password is required", {
        cause: 401,
      })
    );
  }

  if (!confirmationPassword) {
    return next(
      new Error("Confirmation password is required", {
        cause: 401,
      })
    );
  }

  const user = await dbService.findOne({
    model: userModel,
    filter: { email, isDeleted: false },
  });

  if (!user) {
    return next(
      new Error(
        "This email is not belongs to any account, please write a valid email",
        {
          cause: 404,
        }
      )
    );
  }

  if (!compareHash({ plaintext: OTP, encryptedText: user.resetPasswordOTP })) {
    await dbService.updateOne({
      model: userModel,
      filter: { email },
      data: { $inc: { otpAttempts: 1 } },
    });

    if (user.otpAttempts + 1 >= 5) {
      emailEvent.emit("forgetPassword", { id: user._id, email });
      return next(
        new Error(
          "5 invalid attempts, OTP expired, Please check the new OTP. OTP expires in 5 minutes!",
          {
            cause: 400,
          }
        )
      );
    }

    return next(new Error("OTP is not correct", { cause: 400 }));
  }

  await dbService.updateOne({
    model: userModel,
    filter: { email },
    data: {
      $set: {
        password: generateHash({
          plaintext: password,
          saltRounds: parseInt(process.env.SALT_ROUNDS),
          changeCredentialsTime: Date.now(),
        }),
      },
      $unset: { resetPasswordOTP: 1, otpCreatedAt: 1, otpAttempts: 1 },
    },
  });

  return successResponse({
    res,
    status: 200,
    message: "Password updated successfully",
  });
});

export default resetPassword;
