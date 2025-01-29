import joi from "joi";
import { generalFields } from "../../middlewares/validation.middleware.js";

export const signup = joi
  .object()
  .keys({
    username: generalFields.username.required(),
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    confirmationPassword: generalFields.confirmationPassword.required(),
    phoneNumber: generalFields.phoneNumber.required(),
  })
  .required();

export const confirmEmail = joi
  .object()
  .keys({
    email: generalFields.email.required(),
    OTP: generalFields.OTP.required(),
  })
  .required();
