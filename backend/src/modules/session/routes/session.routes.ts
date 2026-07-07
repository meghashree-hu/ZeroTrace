import { Router } from "express";

import { createSession } from "../controllers/session.controller";
import { approve } from "../controllers/approve.controller";
import { reject } from "../controllers/reject.controller";
import { getPendingRequests } from "../controllers/pending.controller";
import { getSessionStatus } from "../controllers/status.controller";
import { authenticate } from "../../../middleware/auth.middleware";

const router = Router();

router.post(
    "/request",
    createSession
);

router.get(
    "/status/:shareToken",
    getSessionStatus
);

router.get(
    "/pending",
    authenticate,
    getPendingRequests
);

router.post(
    "/:sessionId/approve",
    authenticate,
    approve
);

router.post(
    "/:sessionId/reject",
    authenticate,
    reject
);

export default router;
