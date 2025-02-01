import { asyncHandler } from "../../../utils/response/error.response.js";
import { generateHash } from "../../../utils/security/hash.security.js";
import { userModel } from "../../../db/models/User.model.js";
import { emailEvent } from "../../../utils/events/email.event.js";
import { successResponse } from "../../../utils/response/success.response.js";

const signup = asyncHandler(async (req, res, next) => {
  const { username, email, phoneNumber, password } = req.body;

  const user = await userModel.findOne({ email });

  if (user) {
    return next(Error("Email exist", { cause: 409 }));
  }

  const registrationData = { username, email, phoneNumber, password };

  const hashedPassword = generateHash({ plaintext: password });
  registrationData.password = hashedPassword;

  const newUser = await userModel.create(registrationData);

  emailEvent.emit("sendConfirmEmail", { id: newUser._id, email });

  return successResponse({
    res,
    status: 201,
    message:
      "User added successfully, Please check your email to verify your account",
    data: newUser,
  });
});

export default signup;
