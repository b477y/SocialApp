import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../db/db.service.js";
import { userModel } from "../../../db/models/User.model.js";

export const getProfile = asyncHandler(async (req, res, next) => {
  const user = await dbService.findOne({
    model: userModel,
    filter: { _id: req.user._id, isDeleted: false },
    populate: [
      { path: "viewers.viewer", select: "username email gender" },
    ],
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
