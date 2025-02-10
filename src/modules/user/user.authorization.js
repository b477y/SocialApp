import { roleTypes } from "../../db/models/User.model.js";

export const endpoint = {
  dashboard: [roleTypes.superAdmin, roleTypes.admin],
  updateUserRole: [roleTypes.superAdmin, roleTypes.admin],
};
