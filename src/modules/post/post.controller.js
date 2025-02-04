import { Router } from "express";
import * as postService from "./services/post.service.js";
// import * as validators from "./post.validation.js";
// import { validation } from "../../middlewares/validation.middleware.js";
import { endpoint } from "./post.authorization.js";
import {
  authentication,
  authorization,
} from "../../middlewares/auth.middleware.js";
import {
  fileValidations,
  uploadCloudFile,
} from "../../utils/multer/cloud.multer.js";

const router = Router();

router.post(
  "/",
  authentication(),
  authorization(endpoint.createPost),
  uploadCloudFile(fileValidations.image).array("attachment", 2),
  postService.createPost
);

export default router;
