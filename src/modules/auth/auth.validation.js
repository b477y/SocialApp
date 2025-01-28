import joi from "joi";
import { generalFields } from "../../middlewares/validation.middleware.js";

export const signup = joi
  .object()
  .keys({
    username: generalFields.username.required(),
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    confirmationPassword: generalFields.confirmationPassword.required(),
  })
  .required();
