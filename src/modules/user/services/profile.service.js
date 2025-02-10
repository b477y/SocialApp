import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../db/db.service.js";
import { roleTypes, userModel } from "../../../db/models/User.model.js";
import { postModel } from "../../../db/models/Post.model.js";
import { emailEvent } from "../../../utils/events/email.event.js";
import {
  compareHash,
  generateHash,
} from "../../../utils/security/hash.security.js";
import { cloud } from "../../../utils/multer/cloudinary.multer.js";

export const dashboard = asyncHandler(async (req, res, next) => {
  const result = await Promise.allSettled([
    await dbService.find({
      model: userModel,
      filter: { isDeleted: false },
      populate: [{ path: "viewers.viewer", select: "username email gender" }],
    }),
    await dbService.find({
      model: postModel,
      filter: { isDeleted: false },
      populate: [
        {
          path: "comments",
          match: {
            deletedAt: { $exists: false },
            commentId: { $exists: false },
          },
          populate: [
            { path: "replies", match: { deletedAt: { $exists: false } } },
          ],
        },
      ],
    }),
  ]);

  return successResponse({
    res,
    status: 200,
    message: "Profiles & posts retrieved successfully",
    data: { result },
  });
});

export const updateUserRole = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { newRole } = req.body;

  const role =
    req.user.role === roleTypes.superAdmin
      ? { role: { $nin: [roleTypes.superAdmin] } }
      : { role: { $nin: [roleTypes.superAdmin, roleTypes.admin] } };

  const user = await dbService.findOneAndUpdate({
    model: userModel,
    filter: {
      _id: userId,
      isDeleted: false,
      ...role,
    },
    data: {
      role: newRole,
      updatedBy: req.user._id,
    },
    options: {
      new: true,
    },
  });

  return successResponse({
    res,
    status: 200,
    message: "The role changed successfully",
    data: { user },
  });
});

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

export const updatePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, password, confirmationPassword } = req.body;

  if (!oldPassword || !password || !confirmationPassword) {
    return next(new Error("All inputs are required", { cause: 401 }));
  }

  if (
    !compareHash({ plaintext: oldPassword, encryptedText: req.user.password })
  ) {
    return next(new Error("The old Password is not correct", { cause: 409 }));
  }

  if (oldPassword === password) {
    return next(
      new Error(
        "The new password can not be the same of old password, Please enter another new password",
        {
          cause: 401,
        }
      )
    );
  }

  if (password !== confirmationPassword) {
    return next(
      new Error("New password & confirmation password not matched", {
        cause: 401,
      })
    );
  }

  await dbService.findByIdAndUpdate({
    model: userModel,
    id: req.user._id,
    data: {
      password: generateHash({ plaintext: password }),
      changeCredentialsTime: Date.now(),
    },
  });

  return successResponse({
    res,
    status: 200,
    message: "Password updated successfully",
  });
});

export const updateProfile = asyncHandler(async (req, res, next) => {
  const { username, DOB, gender, phoneNumber, address } = req.body;

  await dbService.findByIdAndUpdate({
    model: userModel,
    id: req.user._id,
    data: {
      username,
      DOB,
      gender,
      phoneNumber,
      address,
    },
  });

  return successResponse({
    res,
    status: 200,
    message: "Profile updated successfully",
  });
});

export const updateProfileImage = asyncHandler(async (req, res, next) => {
  const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, {
    folder: `${process.env.APP_NAME}/user/${req.user._id}/profile`,
  });

  const user = await dbService.findByIdAndUpdate({
    model: userModel,
    id: req.user._id,
    data: {
      image: { secure_url, public_id },
    },
    options: { new: false },
  });

  if (user.image?.public_id) {
    await cloud.uploader.destroy(user.image.public_id);
  }

  return successResponse({
    res,
    status: 200,
    message: "Image uploaded successfully",
    data: { user },
  });
});

export const updateProfileCover = asyncHandler(async (req, res, next) => {
  let images = [];

  for (const file of req.files) {
    const { secure_url, public_id } = await cloud.uploader.upload(file.path, {
      folder: `${process.env.APP_NAME}/user/${req.user._id}/profile/cover`,
    });

    images.push({ secure_url, public_id });
  }

  const user = await dbService.findByIdAndUpdate({
    model: userModel,
    id: req.user._id,
    data: {
      coverImages: images,
    },
    options: { new: true },
  });

  return successResponse({
    res,
    status: 200,
    message: "Cover image/s uploaded successfully",
    data: { user },
  });
});
