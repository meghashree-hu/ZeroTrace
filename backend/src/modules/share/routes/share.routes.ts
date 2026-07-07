import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import {
  extendShareExpiry,
  generateShare,
  getShareHistory,
  revokeShare,
  validateShareLink
} from "../controllers/share.controller";
import { viewSharedDocument } from "../controllers/view.controller";

const router = Router();

router.post(
  "/generate",
  authenticate,
  generateShare
);

router.get(
  "/history",
  authenticate,
  getShareHistory
);

router.post(
  "/:shareId/revoke",
  authenticate,
  revokeShare
);

router.post(
  "/:shareId/extend",
  authenticate,
  extendShareExpiry
);

router.get(
  "/:shareToken/view",
  viewSharedDocument
);

router.get(
  "/:shareToken",
  validateShareLink
);

export default router;
