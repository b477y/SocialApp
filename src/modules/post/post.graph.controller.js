import * as postQueryService from "./services/post.query.service.js";
import * as postTypes from "./types/post.types.js";

export const query = {
  postList: {
    type: postTypes.postListResponse,
    resolve: postQueryService.postList,
  },
};
