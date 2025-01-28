import { Router } from "express";
import * as registrationService from "./services/registration.service.js";

const router = Router();

router.get("/", registrationService.signup);

export default router;
