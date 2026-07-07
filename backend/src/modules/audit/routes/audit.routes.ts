import { Router } from "express";
import { getAuditLogs } from "./../controllers/audit.controller";

const router = Router();

router.get("/logs", getAuditLogs);

export default router;
