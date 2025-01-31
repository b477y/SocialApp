import { Router } from "express";
import register from "../../modules/auth/services/register.service.js";
import login from "../../modules/auth/services/login.service.js";
import confirmEmail from "../../modules/auth/services/confirmEmail.service.js";
import { validation } from "../../middlewares/validation.middleware.js";
import * as validators from "./auth.validation.js";
import refreshToken from "./services/refreshToken.service.js";

const router = Router();

router.post("/register", validation(validators.register), register);
router.post("/login", validation(validators.login), login);
router.patch(
  "/confirm-email",
  validation(validators.confirmEmail),
  confirmEmail
);

router.get("/refresh-token", refreshToken);

export default router;
