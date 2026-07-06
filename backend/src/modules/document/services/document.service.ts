import { v4 as uuidv4 } from "uuid";

import Document from "../../../models/document.model";
import Policy from "../../../models/policy.model";

export const uploadDocument = async (
  ownerId: string,
  file: Express.Multer.File,
  documentName: string,
  accessMode: string,
  expiryMinutes: number,
  maxViews: number,
  maxPrints: number,
  downloadAllowed: boolean,
  approvalRequired: boolean,
  watermarkEnabled: boolean
) => {

  console.log(file);
  console.log("Mime Type:", file.mimetype);

  const document = await Document.create({

    documentId: `DOC-${uuidv4().slice(0, 8).toUpperCase()}`,

    ownerId,

    originalFileName: file.originalname,

    mimeType: file.mimetype,

    fileSize: file.size,

    status: "UPLOADED"

  });

  await Policy.create({

    policyId: `POL-${uuidv4().slice(0, 8).toUpperCase()}`,

    documentId: document.documentId,

    accessMode,

    expiryMinutes,

    maxViews,

    maxPrints,

    downloadAllowed,

    approvalRequired,

    watermarkEnabled

  });

  return document;

};