import { Router } from "express";

import { createSession } from "../controllers/session.controller";
import { approve } from "../controllers/approve.controller";

const router = Router();

router.post(
    "/request",
    createSession
);

export default router;
router.post(
    "/approve",
    approve
);