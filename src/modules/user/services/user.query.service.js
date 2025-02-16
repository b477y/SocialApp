import { authentication } from "../../../middlewares/graph/auth.middleware.js";
import { validation } from "../../../middlewares/graph/validation.middleware.js";
import { getProfileGraph } from "../user.validation.js";

export const getProfile = async (parent, args) => {
  const { authorization } = args;

  await validation(getProfileGraph, args);

  const user = await authentication({ authorization });

  if (!user) {
    return { message: "User not found", statusCode: 404 };
  }

  return {
    message: "User retrieved successfully",
    statusCode: 200,
    data: user,
  };
};
