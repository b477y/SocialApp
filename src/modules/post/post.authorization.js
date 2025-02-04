import { roleTypes } from "../../db/models/User.model.js";

export const endpoint = {
  createPost: [roleTypes.user],
  updatePost: [roleTypes.user],
};
