import { asyncHandler } from "../../../utils/response/error.response.js";

export const signup = asyncHandler(async (req, res, next) => {
  const { username, email, password, confirmationPassword } = req.body;
  const data = { username, email, password };
  return res.status(200).json({ message: "Signup" });
});
