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

  await userModel.create(registrationData);

  emailEvent.emit("sendConfirmEmail", { email });

  return successResponse({
    res,
    status: 201,
    message: "User added successfully",
    data: registrationData,
  });
});

export default signup;
