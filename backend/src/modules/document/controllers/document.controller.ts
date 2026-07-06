import { Response } from "express";
import { validationResult } from "express-validator";

import { AuthRequest } from "../../../middleware/auth.middleware";

import { uploadDocument } from "../services/document.service";

export const upload = async (

    req: AuthRequest,

    res: Response

) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        return res.status(400).json({

            errors: errors.array()

        });

    }

    if (!req.file) {

        return res.status(400).json({

            success: false,

            message: "No file uploaded"

        });

    }

    try {

        const {

    documentName,

    accessMode,

    expiryMinutes,

    maxViews,

    maxPrints,

    downloadAllowed,

    approvalRequired,

    watermarkEnabled

} = req.body; 

        const document = await uploadDocument(

    req.user!.id,

    req.file,

    documentName,

    accessMode,

    Number(expiryMinutes),

    Number(maxViews),

    Number(maxPrints),

    downloadAllowed === "true",

    approvalRequired === "true",

    watermarkEnabled === "true"

);
        return res.status(201).json({

            success: true,

            message: "Document uploaded successfully",

            data: document

        });

    } catch (error: any) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};