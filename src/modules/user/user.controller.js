import { Router } from "express";
import { authentication } from "../../middlewares/auth.middleware.js";
import getProfile from "./services/profile.service.js";

const router = Router();

router.get("/profile", authentication(), getProfile);

export default router;
