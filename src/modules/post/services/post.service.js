import { cloud } from "../../../utils/multer/cloudinary.multer.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { postModel } from "../../../db/models/Post.model.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../db/db.service.js";

export const createPost = asyncHandler(async (req, res, next) => {
  const { content } = req.body;

  let attachments = [];

  for (const file of req.files) {
    const { secure_url, public_id } = await cloud.uploader.upload(file.path, {
      folder: `${process.env.APP_NAME}/user/${req.user._id}/posts`,
    });
    attachments.push({ secure_url, public_id });
  }

  const post = await dbService.create({
    model: postModel,
    data: { content, attachments, createdBy: req.user._id },
  });

  return successResponse({
    res,
    status: 201,
    message: "Post created successfully",
    data: post,
  });
});
