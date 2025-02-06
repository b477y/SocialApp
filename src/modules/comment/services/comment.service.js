import { asyncHandler } from "../../../utils/response/error.response.js";
import * as dbService from "../../../db/db.service.js";
import { commentModel } from "../../../db/models/Comment.model.js";
import { postModel } from "../../../db/models/Post.model.js";
import { cloud } from "../../../utils/multer/cloudinary.multer.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { roleTypes } from "../../../db/models/User.model.js";

export const createComment = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  const post = await dbService.findOne({
    model: postModel,
    filter: { _id: postId, deletedAt: { $exists: false } },
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
    filter: { _id: postId, deletedAt: { $exists: false } },
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
      deletedAt: { $exists: false },
    },
    populate: { path: "postId" },
  });

  if (!comment || comment.postId.deletedAt)
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
      deletedAt: { $exists: false },
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

export const freezeComment = asyncHandler(async (req, res, next) => {
  const { postId, commentId } = req.params;

  if (!postId) return next(new Error("Post id is required", { cause: 409 }));

  if (!commentId)
    return next(new Error("Comment id is required", { cause: 409 }));

  const comment = await dbService.findOne({
    model: commentModel,
    filter: {
      _id: commentId,
      postId,
      deletedAt: { $exists: false },
    },
    populate: { path: "postId" },
  });

  if (!comment) {
    return next(new Error("Invalid comment ID or not found", { cause: 404 }));
  }

  if (comment?.postId?.deletedAt) {
    return next(
      new Error("Cannot freeze comment: Post is deleted", { cause: 400 })
    );
  }

  const isAuthorized =
    comment.createdBy.toString() === req.user._id.toString() ||
    comment?.postId?.createdBy.toString() === req.user._id.toString() ||
    req.user.role === roleTypes.admin;

  if (!isAuthorized) {
    return next(new Error("Unauthorized or post is deleted", { cause: 403 }));
  }

  const updatedComment = await dbService.findOneAndUpdate({
    model: commentModel,
    filter: {
      _id: commentId,
      postId,
      deletedAt: { $exists: false },
    },
    data: {
      deletedAt: Date.now(),
      deletedBy: req.user._id,
    },
    options: { new: true },
  });

  return successResponse({
    res,
    status: 200,
    message: "Comment frozen successfully",
    data: { comment: updatedComment },
  });
});

export const unfreezeComment = asyncHandler(async (req, res, next) => {
  const { postId, commentId } = req.params;

  if (!postId) return next(new Error("Post id is required", { cause: 409 }));

  if (!commentId)
    return next(new Error("Comment id is required", { cause: 409 }));

  const comment = await dbService.findOneAndUpdate({
    model: commentModel,
    filter: {
      _id: commentId,
      postId,
      deletedBy: req.user._id,
      deletedAt: { $exists: true },
    },
    data: {
      $unset: {
        deletedAt: 1,
        deletedBy: 1,
      },
      updatedBy: req.user._id,
    },
    options: { new: true },
  });

  if (!comment) {
    return next(new Error("Invalid comment ID or not found", { cause: 404 }));
  }

  if (comment?.postId?.deletedAt) {
    return next(
      new Error("Cannot unfreeze comment: Post is deleted", { cause: 400 })
    );
  }

  return successResponse({
    res,
    status: 200,
    message: "Comment unfrozen successfully",
    data: { comment },
  });
});

export const reactToComment = asyncHandler(async (req, res, next) => {
  const { postId, commentId } = req.params;
  const { action } = req.query;

  if (!postId) return next(new Error("Post id is required", { cause: 409 }));

  if (!commentId)
    return next(new Error("Comment id is required", { cause: 409 }));

  if (!action) {
    return next(
      new Error("The action (query param) is required", { cause: 400 })
    );
  }

  if (!["like-comment", "unlike-comment"].includes(action)) {
    return next(
      new Error(
        "Invalid action value. Allowed values: ['like-comment', 'unlike-comment']",
        { cause: 400 }
      )
    );
  }

  const data =
    action === "like-comment"
      ? { $addToSet: { likes: req.user._id } }
      : { $pull: { likes: req.user._id } };

  const comment = await dbService.findOneAndUpdate({
    model: commentModel,
    filter: {
      _id: commentId,
      postId: postId,
      deletedAt: { $exists: false },
    },
    data,
    options: {
      new: true,
    },
  });

  return successResponse({
    res,
    status: 200,
    message:
      action === "like-comment"
        ? "Comment liked successfully"
        : "Comment unliked successfully",
    data: { comment },
  });
});
