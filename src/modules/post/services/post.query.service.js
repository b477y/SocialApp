import * as dbService from "../../../db/db.service.js";
import { postModel } from "../../../db/models/Post.model.js";

export const postList = async (parent, args) => {
  const posts = await dbService.find({
    model: postModel,
    filter: {
      isDeleted: { $exists: false },
    },
  });

  if (!posts.length) {
    return { message: "There are no posts", statusCode: 404 };
  }

  return {
    message: "Posts retrieved successfully",
    statusCode: 200,
    data: posts,
  };
};
