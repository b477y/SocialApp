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

export const updateComment = asyncHandler(async (req, res, next) => {
  const { postId, commentId } = req.params;

  if (!postId) return next(new Error("Post id is required", { cause: 409 }));

  if (!commentId)
    return next(new Error("Comment id is required", { cause: 409 }));

  const comment = await dbService.findOne({
    model: commentModel,
    filter: {
      _id: commentId,
      postId,
      createdBy: req.user._id,
      isDeleted: { $exists: false },
    },
    populate: { path: "postId" },
  });

  if (!comment || comment.postId.isDeleted)
    return next(new Error("Comment not found", { cause: 404 }));

  if (req.files?.length) {
    const attachments = [];

    for (const file of req.files) {
      const { secure_url, public_id } = await cloud.uploader.upload(file.path, {
        folder: `${process.env.APP_NAME}/${comment.postId.createdBy}/posts/${postId}/comments`,
      });
      attachments.push({ secure_url, public_id });
    }
    req.body.attachments = attachments;
  }

  const updatedComment = await dbService.findOneAndUpdate({
    model: commentModel,
    filter: {
      _id: commentId,
      postId,
      createdBy: req.user._id,
      isDeleted: { $exists: false },
    },
    data: {
      ...req.body,
      updatedBy: req.user._id,
    },
    options: { new: true },
  });

  return successResponse({
    res,
    status: 200,
    message: "Comment updated successfully",
    data: { comment: updatedComment },
  });
});
