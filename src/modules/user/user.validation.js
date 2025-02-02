import joi from "joi";
import { generalFields } from "../../middlewares/validation.middleware.js";

export const sharedProfile = joi.object().keys({
  profileId: generalFields.id.required(),
});
