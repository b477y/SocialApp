import { userModel } from "../../../db/models/User.model.js";
import { emailEvent } from "../../../utils/events/email.event.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";

const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new Error("Email is required", { cause: 401 }));
  }

  const user = await userModel.findOne({ email, isDeleted: false });

  if (!user) {
    return next(new Error("In-valid email address", { cause: 404 }));
  }

  if (!user.confirmEmail) {
    return next(
      new Error("Your account is not verified yet, Please verify it first ", {
        cause: 400,
      })
    );
  }

  emailEvent.emit("forgetPassword", { id: user._id, email });

  return successResponse({
    res,
    status: 200,
    message: "Please check your email to update your password",
  });
});

export default forgetPassword;
