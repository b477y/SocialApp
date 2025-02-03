import { Router } from "express";
import { authentication } from "../../middlewares/auth.middleware.js";
import * as profileService from "./services/profile.service.js";
import { roleTypes } from "../../db/models/User.model.js";
import { validation } from "../../middlewares/validation.middleware.js";
import * as validators from "./user.validation.js";

const router = Router();

router.get("/profile", authentication(), profileService.getProfile);

router.get(
  "/profile/:profileId",
  validation(validators.sharedProfile),
  authentication(),
  profileService.sharedProfile
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

export default router;
