import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";

const getProfile = asyncHandler(async (req, res, next) => {
  return successResponse({
    res,
    status: 200,
    message: "Profile retrieved successfully",
    data: { userProfile: req.user },
  });
});

export default getProfile;
