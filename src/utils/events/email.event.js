import { EventEmitter } from "node:events";
import sendEmail from "../email/send.email.js";
import { userModel } from "../../db/models/User.model.js";
import verifyAccountTemplate from "../email/template/verifyAccount.template.js";
import generateOTP from "../../utils/email/generateOTP.js";

export const emailEvent = new EventEmitter();

emailEvent.on("sendConfirmEmail", async (data) => {
  const { email } = data;
  const { hashedOTP, OTP } = generateOTP();

  await userModel.updateOne(
    { email },
    {
      $set: {
        confirmEmailOTP: hashedOTP,
        otpCreatedAt: Date.now(),
        otpAttempts: 0,
      },
    }
  );

  setTimeout(async () => {
    await userModel.updateOne(
      { email, otpCreatedAt: { $lte: new Date(Date.now() - 300000) } },
      {
        $set: { otpAttempts: 0 },
        $unset: { confirmEmailOTP: 1, otpCreatedAt: 1 },
      }
    );
  }, 300000);

  const html = verifyAccountTemplate({ OTP });

  await sendEmail({ to: email, subject: "Confirm Email", html });
});


