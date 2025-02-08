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


router.get("/", authentication(), commentService.getComments);

router.get("/:commentId", authentication(), commentService.getComment);

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

router.delete(
  "/:commentId",
  authentication(),
  authorization(endpoint.freezeComment),
  commentService.freezeComment
);

router.patch(
  "/:commentId/unfreeze",
  authentication(),
  authorization(endpoint.unfreezeComment),
  commentService.unfreezeComment
);

router.patch(
  "/:commentId/react",
  authentication(),
  authorization(endpoint.reactToComment),
  commentService.reactToComment
);

export default router;
