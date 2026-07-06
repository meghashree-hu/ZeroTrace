import { Router } from "express";
import { generateShare } from "../controllers/share.controller";

const router = Router();

router.post(
  "/generate",
  generateShare
);

export default router;