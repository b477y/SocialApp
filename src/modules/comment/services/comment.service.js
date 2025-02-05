import { asyncHandler } from "../../../utils/response/error.response.js";
import * as dbService from "../../../db/db.service.js";
import { commentModel } from "../../../db/models/Comment.model.js";
import { postModel } from "../../../db/models/Post.model.js";
import { cloud } from "../../../utils/multer/cloudinary.multer.js";
import { successResponse } from "../../../utils/response/success.response.js";
export const createComment = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  const post = await dbService.findOne({
    model: postModel,
    filter: { _id: postId, isDeleted: { $exists: false } },
  });

  if (!post) {
    return next(new Error("Invalid post ID", { cause: 404 }));
  }

  if (req.files?.length) {
    const attachments = [];

    for (const file of req.files) {
      const { secure_url, public_id } = await cloud.uploader.upload(file.path, {
        folder: `${process.env.APP_NAME}/${post.createdBy}/posts/${postId}/comments`,
      });
      attachments.push({ secure_url, public_id });
    }
    req.body.attachments = attachments;
  }

  const comment = await dbService.create({
    model: commentModel,
    data: {
      ...req.body,
      postId,
      createdBy: req.user._id,
    },
  });

  const updatedPost = await dbService.updateOne({
    model: postModel,
    filter: { _id: postId, isDeleted: { $exists: false } },
    data: {
      $push: { comments: comment._id },
      createdBy: req.user._id,
    },
  });

  return successResponse({
    res,
    status: 201,
    message: "Comment created successfully",
    data: { comment },
  });
});
