import { Router } from "express";
import {
  authentication,
  authorization,
} from "../../middlewares/auth.middleware.js";
import * as profileService from "./services/profile.service.js";
import { validation } from "../../middlewares/validation.middleware.js";
import * as validators from "./user.validation.js";
import { fileValidations } from "../../utils/multer/local.multer.js";
import { uploadCloudFile } from "../../utils/multer/cloud.multer.js";
import { roleTypes } from "../../db/models/User.model.js";
import { endpoint } from "./user.authorization.js";

const router = Router();

router.get(
  "/profile/dashboard",
  authentication(),
  authorization(endpoint.dashboard),
  profileService.dashboard
);

router.get("/profile", authentication(), profileService.getProfile);

router.get(
  "/profile/:profileId",
  validation(validators.sharedProfile),
  authentication(),
  profileService.sharedProfile
);

router.patch(
  "/:userId/profile/dashboard/role",
  validation(validators.updateUserRole),
  authentication([roleTypes.admin, roleTypes.superAdmin]),
  authorization(endpoint.updateUserRole),
  profileService.updateUserRole
);

router.patch(
  "/profile/",
  validation(validators.updateProfile),
  authentication(),
  profileService.updateProfile
);

router.patch(
  "/profile/update-image",
  authentication(),
  uploadCloudFile(fileValidations.image).single("image"),
  profileService.updateProfileImage
);

router.patch(
  "/profile/update-cover",
  authentication(),
  uploadCloudFile(fileValidations.image).array("image", 3),
  profileService.updateProfileCover
);

router.patch(
  "/profile/update-email",
  validation(validators.updateEmail),
  authentication(),
  profileService.updateEmail
);

router.patch(
  "/profile/reset-email",
  validation(validators.resetEmail),
  authentication(),
  profileService.resetEmail
);

router.patch(
  "/profile/update-password",
  validation(validators.updatePassword),
  authentication(),
  profileService.updatePassword
);

export default router;
