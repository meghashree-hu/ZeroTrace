import { Router } from "express";

import { authenticate } from "../../../middleware/auth.middleware";

import uploadMiddleware from "../../../middleware/upload.middleware";

import { upload } from "../controllers/document.controller";

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

export default router;