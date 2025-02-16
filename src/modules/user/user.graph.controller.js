import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { getProfile } from "./services/user.query.service.js";
import { getProfileResponse } from "./types/user.types.js";

export const query = {
  getProfile: {
    type: getProfileResponse,
    args: {
      authorization: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: getProfile,
  },
};
