import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import { getAuditLogs } from "./../controllers/audit.controller";

const router = Router();
router.get("/logs", authenticate, getAuditLogs);

export default router;
