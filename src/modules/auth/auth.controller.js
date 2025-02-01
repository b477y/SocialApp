import { Router } from "express";
import { validation } from "../../middlewares/validation.middleware.js";
import * as validators from "./auth.validation.js";
import register from "../../modules/auth/services/register.service.js";
import login from "../../modules/auth/services/login.service.js";
import confirmEmail from "../../modules/auth/services/confirmEmail.service.js";
import refreshToken from "./services/refreshToken.service.js";
import forgetPassword from "./services/forgetPassword.service.js";
import validateForgetPassword from "./services/validateForgetPassword.js";
import resetPassword from "./services/resetPassword.service.js";

const router = Router();

router.post("/register", validation(validators.register), register);
router.post("/login", validation(validators.login), login);
router.patch(
  "/confirm-email",
  validation(validators.confirmEmail),
  confirmEmail
);

router.get("/refresh-token", refreshToken);

router.patch(
  "/forget-password",
  validation(validators.forgetPassword),
  forgetPassword
);

router.patch(
  "/validate-forget-password",
  validation(validators.validateForgetPassword),
  validateForgetPassword
);

router.patch(
  "/reset-password",
  validation(validators.resetPassword),
  resetPassword
);

export default router;
