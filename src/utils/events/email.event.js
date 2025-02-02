import { EventEmitter } from "node:events";
import sendEmail from "../email/send.email.js";
import { userModel } from "../../db/models/User.model.js";
import verifyAccountTemplate from "../email/template/verifyAccount.template.js";
import resetPasswordTemplate from "../email/template/resetPassword.template.js";
import generateOTP from "../../utils/email/generateOTP.js";
import * as dbService from "../../db/db.service.js";

export const emailEvent = new EventEmitter();

export const emailSubject = {
  confirmEmail: "Confirm email",
  resetPassword: "Reset password",
};

export const sendOTP = async ({ data, subject, template } = {}) => {
  const { id, email } = data;

  const { hashedOTP, OTP } = generateOTP();

  let updateData = {};

  switch (subject) {
    case emailSubject.confirmEmail:
      updateData = { confirmEmailOTP: hashedOTP };
      break;

    case emailSubject.resetPassword:
      updateData = { resetPasswordOTP: hashedOTP };
      break;

    default:
      break;
  }

  await dbService.findByIdAndUpdate({
    model: userModel,
    id,
    data: { ...updateData, otpCreatedAt: Date.now(), otpAttempts: 0 },
  });

  setTimeout(async () => {
    await dbService.updateOne({
      model: userModel,
      filter: {
        email,
        otpCreatedAt: { $lte: Date.now() - 300000 },
      },
      data: {
        $set: { otpAttempts: 0 },
        $unset: { [Object.keys(updateData)[0]]: 1, otpCreatedAt: 1 },
      },
    });
  }, 300000);

  const html = template({ OTP });

  await sendEmail({ to: email, subject, html });
};

emailEvent.on("sendConfirmEmail", async (data) => {
  await sendOTP({
    data,
    subject: emailSubject.confirmEmail,
    template: verifyAccountTemplate,
  });
});

emailEvent.on("forgetPassword", async (data) => {
  await sendOTP({
    data,
    subject: emailSubject.resetPassword,
    template: resetPasswordTemplate,
  });
});
