import joi from "joi";
import { generalFields } from "../../middlewares/validation.middleware.js";

export const sharedProfile = joi
  .object()
  .keys({
    profileId: generalFields.id.required(),
  })
  .required();

export const updateEmail = joi
  .object()
  .keys({
    email: generalFields.email.required(),
  })
  .required();

export const resetEmail = joi
  .object()
  .keys({
    confirmEmailOTP: generalFields.OTP.required(),
    temporaryEmailOTP: generalFields.OTP.required(),
    email: generalFields.email.required(),
  })
  .required();
