import { roleTypes } from "../../db/models/User.model.js";

export const endpoint = {
  createPost: [roleTypes.user],
  updatePost: [roleTypes.user],
  freezePost: Object.values(roleTypes),
  unfreezePost: Object.values(roleTypes),
  like: [roleTypes.user],
  unlike: [roleTypes.user],
};
