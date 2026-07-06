import { Router } from "express";

import { authenticate } from "../../../middleware/auth.middleware";

import uploadMiddleware from "../../../middleware/upload.middleware";

import {
  upload,
  getDocuments,
  getDocumentById,
  deleteDocument,
} from "../controllers/document.controller";

import {

    uploadDocumentValidator

} from "../validators/document.validator";

const router = Router();

router.post(

    "/upload",

    authenticate,

    uploadMiddleware.single("document"),

    uploadDocumentValidator,

    upload

);
router.get(
  "/",
  authenticate,
  getDocuments
);

router.get(
  "/:documentId",
  authenticate,
  getDocumentById
);

router.delete(
  "/:documentId",
  authenticate,
  deleteDocument
);
export default router;