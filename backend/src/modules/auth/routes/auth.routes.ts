import { Router } from "express";
import {
  register,
  login,
profile,
} from "../controllers/auth.controller";
import { authenticate } from "../../../middleware/auth.middleware";

import {
  registerValidator,
  loginValidator,
} from "../validators/auth.validator";

const router = Router();

router.post(
  "/register",
  registerValidator,
  register
);
router.post(
  "/login",
  loginValidator,
  login
);
router.get(
  "/profile",
  authenticate,
  profile
);

export default router;
