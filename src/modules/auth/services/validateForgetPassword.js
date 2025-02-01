import { userModel } from "../../../db/models/User.model.js";
import { emailEvent } from "../../../utils/events/email.event.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { compareHash } from "../../../utils/security/hash.security.js";

const validateForgetPassword = asyncHandler(async (req, res, next) => {
  const { email, OTP } = req.body;

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

  const user = await userModel.findOne({ email, isDeleted: false });

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

  if (!user.confirmEmail) {
    return next(
      new Error("Your account is not verified yet, Please verify it first ", {
        cause: 400,
      })
    );
  }

  if (!compareHash({ plaintext: OTP, encryptedText: user.resetPasswordOTP })) {
    await userModel.updateOne({ email }, { $inc: { otpAttempts: 1 } });

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

  await userModel.updateOne(
    { email },
    {
      $unset: { resetPasswordOTP: 1, otpCreatedAt: 1, otpAttempts: 1 },
    }
  );

  return successResponse({
    res,
    status: 200,
    message: "OTP is correct please enter a new password",
  });
});

export default validateForgetPassword;
