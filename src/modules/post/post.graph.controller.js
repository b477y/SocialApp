import * as postQueryService from "./services/post.query.service.js";
import * as postMutationService from "./services/post.mutation.service.js";
import * as postTypes from "./types/post.types.js";
import {
  GraphQLEnumType,
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
} from "graphql";

export const query = {
  postList: {
    type: postTypes.postListResponse,
    resolve: postQueryService.postList,
  },
};

export const mutation = {
  reactToPost: {
    type: postTypes.reactToPostResponse,
    args: {
      postId: { type: new GraphQLNonNull(GraphQLID) },
      authorization: { type: new GraphQLNonNull(GraphQLString) },
      action: {
        type: new GraphQLNonNull(
          new GraphQLEnumType({
            name: "actionTypes",
            values: {
              like: { value: "like" },
              unlike: { value: "unlike" },
            },
          })
        ),
      },
    },
    resolve: postMutationService.reactToPost,
  },
};
