import { asyncHandler } from "../../../utils/response/error.response.js";
import { generateHash } from "../../../utils/security/hash.security.js";
import { userModel } from "../../../db/models/User.model.js";
import { emailEvent } from "../../../utils/events/email.event.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../db/db.service.js";

const register = asyncHandler(async (req, res, next) => {
  const { username, email, phoneNumber, password } = req.body;

  const user = await dbService.findOne({ model: userModel, filter: { email } });

  if (user) {
    return next(Error("Email exist", { cause: 409 }));
  }

  const data = { username, email, phoneNumber, password };

  // const hashedPassword = generateHash({ plaintext: password });
  // data.password = hashedPassword;

  const newUser = await dbService.create({
    model: userModel,
    data,
  });

  emailEvent.emit("sendConfirmEmail", { id: newUser._id, email });

  return successResponse({
    res,
    status: 201,
    message:
      "User added successfully, Please check your email to verify your account",
    data: newUser,
  });
});

export default register;
