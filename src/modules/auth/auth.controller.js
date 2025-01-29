import { Router } from "express";
import * as registrationService from "./services/registration.service.js";
import { validation } from "../../middlewares/validation.middleware.js";
import * as validators from "./auth.validation.js";

const router = Router();

router.post(
  "/signup",
  validation(validators.signup),
  registrationService.signup
);

router.patch(
  "/confirm-email",
  validation(validators.confirmEmail),
  registrationService.confirmEmail
);

export default router;
