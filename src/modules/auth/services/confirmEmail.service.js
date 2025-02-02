import { asyncHandler } from "../../../utils/response/error.response.js";
import { compareHash } from "../../../utils/security/hash.security.js";
import { userModel } from "../../../db/models/User.model.js";
import { emailEvent } from "../../../utils/events/email.event.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../db/db.service.js";

const confirmEmail = asyncHandler(async (req, res, next) => {
  const { email, OTP } = req.body;

  if (!email) {
    return next(new Error("Email is required", { cause: 401 }));
  }

  const user = await dbService.findOne({ model: userModel, filter: { email } });

  if (!user) {
    return next(new Error("User doesn't exist", { cause: 404 }));
  }

  if (user.confirmEmail) {
    return next(new Error("Already confirmed", { cause: 409 }));
  }

  if (
    !user.confirmEmailOTP ||
    user.otpCreatedAt < new Date(Date.now() - 300000)
  ) {
    emailEvent.emit("sendConfirmEmail", { id: user._id, email });
    return next(
      new Error(
        "OTP has expired. A new OTP sent to your email please check it. OTP expires in 5 minutes!",
        { cause: 400 }
      )
    );
  }

  if (
    !compareHash({
      plaintext: OTP,
      encryptedText: user.confirmEmailOTP,
    })
  ) {
    await dbService.updateOne({
      model: userModel,
      filter: { email },
      data: { $inc: { otpAttempts: 1 } },
    });

    if (user.otpAttempts + 1 >= 5) {
      emailEvent.emit("sendConfirmEmail", { id: user._id, email });
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
    $set: { confirmEmail: true },
    $unset: { confirmEmailOTP: 1, otpCreatedAt: 1, otpAttempts: 1 }},
  });

  return successResponse({
    res,
    status: 200,
    message: "Email confirmed successfully",
  });
});

export default confirmEmail;
