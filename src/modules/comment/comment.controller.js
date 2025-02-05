import { Router } from "express";
import * as commentService from "./services/comment.service.js";
import {
  authentication,
  authorization,
} from "../../middlewares/auth.middleware.js";
import { endpoint } from "./comment.authorization.js";
import {
  fileValidations,
  uploadCloudFile,
} from "../../utils/multer/cloud.multer.js";

const router = Router({
  mergeParams: true,
});

router.post(
  "/",
  authentication(),
  authorization(endpoint.createComment),
  uploadCloudFile(fileValidations.image).array("attachment", 2),
  commentService.createComment
);

router.patch(
  "/:commentId",
  authentication(),
  authorization(endpoint.updateComment),
  uploadCloudFile(fileValidations.image).array("attachment", 2),
  commentService.updateComment
);

export default router;
