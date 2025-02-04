import joi from "joi";
import { generalFields } from "../../middlewares/validation.middleware.js";

// export const createPost = joi.object().keys({
//   content: generalFields.content,
// });

export const freezePost = joi
  .object()
  .keys({
    postId: generalFields.id.required(),
  })
  .required();

export const unfreezePost = joi
  .object()
  .keys({
    postId: generalFields.id.required(),
  })
  .required();
