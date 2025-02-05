import { roleTypes } from "../../db/models/User.model.js";


export const endpoint = {
  createComment: [roleTypes.user],
  updateComment: [roleTypes.user],
  freezeComment: Object.values(roleTypes),
  unfreezeComment: Object.values(roleTypes),
  reactToComment: [roleTypes.user],
};
