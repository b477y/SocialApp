import * as dbService from "../../../db/db.service.js";
import { postModel } from "../../../db/models/Post.model.js";
import { authentication } from "../../../middlewares/graph/auth.middleware.js";
import { validation } from "../../../middlewares/graph/validation.middleware.js";
import { reactToPostGraph } from "../post.validation.js";

export const reactToPost = async (parent, args) => {
  const { postId, authorization, action } = args;

  await validation(reactToPostGraph, args);

  const user = await authentication({ authorization });

  let message, data;

  switch (action) {
    case "like":
      data = {
        $addToSet: { likes: user._id },
      };
      message = "The post liked successfully";
      break;
    case "unlike":
      data = {
        $pull: { likes: user._id },
      };
      message = "The post unliked successfully";
      break;

    default:
      message = "Invalid action value. Allowed values: ['like', 'unlike']";
      break;
  }

  const post = await dbService.findOneAndUpdate({
    model: postModel,
    filter: {
      _id: postId,
      isDeleted: { $exists: false },
    },
    data,
    options: { new: true },
  });

  if (!post) {
    return { message: "In-valid post id", statusCode: 404 };
  }

  return {
    message,
    statusCode: 200,
    data: post,
  };
};
