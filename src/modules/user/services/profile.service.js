import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../db/db.service.js";
import { userModel } from "../../../db/models/User.model.js";
import { emailEvent } from "../../../utils/events/email.event.js";
import { compareHash } from "../../../utils/security/hash.security.js";

export const getProfile = asyncHandler(async (req, res, next) => {
  const user = await dbService.findOne({
    model: userModel,
    filter: { _id: req.user._id, isDeleted: false },
    populate: [{ path: "viewers.viewer", select: "username email gender" }],
  });

  return successResponse({
    res,
    status: 200,
    message: "Profile retrieved successfully",
    data: { Profile: user },
  });
});

export const sharedProfile = asyncHandler(async (req, res, next) => {
  const { profileId } = req.params;

  let user = null;

  if (profileId === req.user._id.toString()) {
    const { username, email, gender } = req.user;
    user = { username, email, gender };
  } else {
    user = await dbService.findOneAndUpdate({
      model: userModel,
      filter: { _id: profileId, isDeleted: false },
      data: {
        $push: { viewers: { viewerId: req.user._id, time: Date.now() } },
      },
      select: "username email gender -_id",
    });
  }

  return user
    ? successResponse({
        res,
        status: 200,
        message: "Profile retrieved successfully",
        data: { Profile: user },
      })
    : next(new Error("In-valid accout", { cause: 404 }));
});

export const updateEmail = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (await dbService.findOne({ model: userModel, filter: { email } })) {
    return next(new Error("This email is already used", { cause: 409 }));
  }

  await dbService.updateOne({
    model: userModel,
    filter: { _id: req.user._id },
    data: { temporaryEmail: email },
  });

  emailEvent.emit("sendConfirmEmail", {
    id: req.user._id,
    email: req.user.email,
  });

  emailEvent.emit("updateEmail", { id: req.user._id, email });

  return successResponse({
    res,
    status: 200,
    message: "OTPs send to your both emails",
  });
});

export const resetEmail = asyncHandler(async (req, res, next) => {
  const { confirmEmailOTP, temporaryEmailOTP, email } = req.body;

  if (await dbService.findOne({ model: userModel, filter: { email } })) {
    return next(new Error("This email is already used", { cause: 409 }));
  }

  if (
    !compareHash({
      plaintext: confirmEmailOTP,
      encryptedText: req.user.confirmEmailOTP,
    }) ||
    !compareHash({
      plaintext: temporaryEmailOTP,
      encryptedText: req.user.temporaryEmailOTP,
    })
  ) {
    await dbService.updateOne({
      model: userModel,
      filter: { id: req.user._id },
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

    return next(new Error("OTPs are not correct", { cause: 400 }));
  }

  const user = await dbService.updateOne({
    model: userModel,
    filter: { _id: req.user._id },
    data: {
      $set: { email, changeCredentialsTime: Date.now() },
      $unset: {
        temporaryEmail: 1,
        temporaryEmailOTP: 1,
        confirmEmailOTP: 1,
        otpAttempts: 1,
        otpCreatedAt: 1,
      },
    },
    options: { new: true },
  });

  return successResponse({
    res,
    status: 200,
    message: "Email updated successfully",
  });
});
