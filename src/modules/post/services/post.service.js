import { cloud } from "../../../utils/multer/cloudinary.multer.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { postModel } from "../../../db/models/Post.model.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../db/db.service.js";
import { roleTypes } from "../../../db/models/User.model.js";
import { paginate } from "../../../utils/pagination.js";

export const getPosts = asyncHandler(async (req, res, next) => {
  let { page, limit } = req.query;

  const response = await paginate({
    model: postModel,
    page,
    limit,
    filter: { isDeleted: { $exists: false } },
    populate: [
      {
        path: "comments",
        match: { deletedAt: { $exists: false }, commentId: { $exists: false } },
        populate: [
          {
            path: "replies",
            match: { deletedAt: { $exists: false } },
          },
        ],
      },
    ],
  });

  if (!response.data.length) {
    return next(new Error("No posts found", { cause: 404 }));
  }

  return successResponse({
    res,
    status: 200,
    message: "Posts retrieved successfully",
    data: { response },
  });
});

export const getPost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  const post = await dbService.findOne({
    model: postModel,
    filter: {
      _id: postId,
      isDeleted: { $exists: false },
    },
    populate: [
      {
        path: "comments",
        match: { deletedAt: { $exists: false }, commentId: { $exists: false } },
        populate: [
          {
            path: "replies",
            match: { deletedBy: { $exists: false } },
          },
        ],
      },
    ],
  });

  if (!post) {
    return next(new Error("Post not found", { cause: 404 }));
  }

  return successResponse({
    res,
    status: 200,
    message: "Post retrieved successfully",
    data: { post },
  });
});

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

export const updatePost = asyncHandler(async (req, res, next) => {
  let attachments = [];

  if (req.files.length) {
    for (const file of req.files) {
      const { secure_url, public_id } = await cloud.uploader.upload(file.path, {
        folder: `${process.env.APP_NAME}/user/${req.user._id}/posts`,
      });
      attachments.push({ secure_url, public_id });
    }
    req.body.attachments = attachments;
  }

  const post = await dbService.findOneAndUpdate({
    filter: {
      _id: req.params.postId,
      isDeleted: { $exists: false },
      createdBy: req.user._id,
    },
    model: postModel,
    data: { ...req.body, updatedBy: req.user._id },
    options: { new: true },
  });

  return post
    ? successResponse({
        res,
        status: 200,
        message: "Post updated successfully",
        data: post,
      })
    : next(new Error("Post not found", { cause: 404 }));
});

export const freezePost = asyncHandler(async (req, res, next) => {
  const owner =
    req.user.role === roleTypes.user ? {} : { createdBy: req.user._id };

  const post = await dbService.findOneAndUpdate({
    filter: {
      _id: req.params.postId,
      isDeleted: { $exists: false },
      ...owner,
    },
    model: postModel,
    data: { isDeleted: true, updatedBy: req.user._id, deletedBy: req.user._id },
    options: { new: true },
  });

  return post
    ? successResponse({
        res,
        status: 200,
        message: "Post frozen successfully",
        data: post,
      })
    : next(new Error("Post not found", { cause: 404 }));
});

export const unfreezePost = asyncHandler(async (req, res, next) => {
  const post = await dbService.findOneAndUpdate({
    filter: {
      _id: req.params.postId,
      isDeleted: { $exists: true },
      deletedBy: req.user._id,
    },
    model: postModel,
    data: {
      $unset: {
        deletedBy: 1,
        isDeleted: 1,
      },
      updatedBy: req.user._id,
    },
    options: { new: true },
  });

  return post
    ? successResponse({
        res,
        status: 200,
        message: "Post unfrozen successfully",
        data: post,
      })
    : next(new Error("Post not found", { cause: 404 }));
});

export const reactToPost = asyncHandler(async (req, res, next) => {
  const { action } = req.query;
  const { postId } = req.params;

  if (!action) {
    return next(
      new Error("The action (query param) is required", { cause: 400 })
    );
  }

  if (!["like-post", "unlike-post"].includes(action)) {
    return next(
      new Error(
        "Invalid action value. Allowed values: ['like-post', 'unlike-post']",
        { cause: 400 }
      )
    );
  }

  const data =
    action === "like-post"
      ? { $addToSet: { likes: req.user._id } }
      : { $pull: { likes: req.user._id } };

  const post = await dbService.findOneAndUpdate({
    filter: { _id: postId, isDeleted: { $exists: false } },
    model: postModel,
    data,
    options: { new: true },
  });

  return post
    ? successResponse({
        res,
        status: 200,
        message:
          action === "like-post"
            ? "Post liked successfully"
            : "Post unliked successfully",
        data: { post },
      })
    : next(new Error("Post not found", { cause: 404 }));
});
