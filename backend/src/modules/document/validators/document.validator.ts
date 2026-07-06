import { body } from "express-validator";

export const uploadDocumentValidator = [

  body("documentName")
    .notEmpty()
    .withMessage("Document name is required"),

  body("accessMode")
    .isIn(["VIEW_PRINT", "PRINT_ONLY"])
    .withMessage("Invalid access mode"),

  body("expiryMinutes")
    .isInt({ min: 1, max: 1440 })
    .withMessage("Expiry must be between 1 minute and 24 hours"),

  body("maxViews")
    .isInt({ min: 0 })
    .withMessage("Invalid max views"),

  body("maxPrints")
    .isInt({ min: 0 })
    .withMessage("Invalid max prints"),

  body("downloadAllowed")
    .isBoolean()
    .withMessage("downloadAllowed must be true or false"),

  body("approvalRequired")
    .isBoolean()
    .withMessage("approvalRequired must be true or false"),

  body("watermarkEnabled")
    .isBoolean()
    .withMessage("watermarkEnabled must be true or false")

];