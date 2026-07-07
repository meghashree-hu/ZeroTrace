import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

import Document from "../../../models/document.model";
import Share from "../../../models/share.model";
import Session from "../../../models/session.model";
import { createAuditLog } from "../../../utils/audit";
import { expireShareAndDocumentIfNeeded } from "../../share/services/share.service";

export const uploadDocument = async (
  ownerId: string,
  file: Express.Multer.File
) => {
  const documentId = `DOC-${uuidv4().slice(0, 8).toUpperCase()}`;
  const extension = path.extname(file.originalname || "").toLowerCase();
  const storedFileName = `${documentId}${extension}`;
  const uploadsDir = path.join(__dirname, "../../../../uploads");
  const storedPath = path.join(uploadsDir, storedFileName);

  fs.mkdirSync(uploadsDir, { recursive: true });
  fs.writeFileSync(storedPath, file.buffer);

  const document = await Document.create({

    documentId,

    ownerId,

    originalFileName: file.originalname,

    mimeType: file.mimetype,

    fileSize: file.size,

    s3Key: storedFileName,

    status: "ACTIVE"

  });

  // Audit log for upload
  try {
    await createAuditLog({
      action: "UPLOAD_DOCUMENT",
      userId: ownerId,
      documentId: document.documentId,
    });
  } catch (e) {
    // swallow logging errors
    console.warn("Failed to create audit log for upload", e);
  }

  return document;

};
export const getDocuments = async (ownerId: string) => {
  const shares = await Share.find({ ownerId });
  await Promise.all(shares.map((share) => expireShareAndDocumentIfNeeded(share)));

  return await Document.find({
    ownerId,
  }).sort({
    createdAt: -1,
  });
};

export const getDocumentStats = async (ownerId: string) => {
  const shares = await Share.find({ ownerId });
  await Promise.all(shares.map((share) => expireShareAndDocumentIfNeeded(share)));

  const [
    documents,
    activeDocuments,
    expiredDocuments,
    revokedDocuments,
    secureShares,
    expiredShares,
    revokedShares,
    pendingRequests,
    approvedRequests,
    printedSessions,
    expiredSessions,
    revokedSessions,
    activeSessions,
    printTotals,
  ] = await Promise.all([
    Document.countDocuments({ ownerId }),
    Document.countDocuments({ ownerId, status: "ACTIVE" }),
    Document.countDocuments({ ownerId, status: "EXPIRED" }),
    Document.countDocuments({ ownerId, status: "REVOKED" }),
    Share.countDocuments({ ownerId, status: "ACTIVE" }),
    Share.countDocuments({ ownerId, status: "EXPIRED" }),
    Share.countDocuments({ ownerId, status: "REVOKED" }),
    Session.countDocuments({ ownerId, status: "REQUESTED" }),
    Session.countDocuments({ ownerId, status: "APPROVED" }),
    Session.countDocuments({ ownerId, status: "COMPLETED" }),
    Session.countDocuments({ ownerId, status: "EXPIRED" }),
    Session.countDocuments({ ownerId, status: "REVOKED" }),
    Session.countDocuments({ ownerId, status: { $in: ["REQUESTED", "APPROVED", "PRINTING"] } }),
    Session.aggregate([
      { $match: { ownerId } },
      { $group: { _id: null, total: { $sum: "$printCount" } } },
    ]),
  ]);

  const recentSessions = await Session.find({ ownerId })
    .sort({ updatedAt: -1 })
    .limit(5)
    .lean();

  const recentActivity = await Promise.all(
    recentSessions.map(async (session: any) => {
      const document = await Document.findOne({ documentId: session.documentId }).lean();

      return {
        title: session.status,
        detail: `${document?.originalFileName || session.documentId} - ${session.requesterEmail || "Unknown requester"}`,
        time: session.updatedAt || session.requestedAt,
      };
    })
  );

  return {
    documents,
    activeDocuments,
    expiredDocuments,
    revokedDocuments,
    secureShares,
    expiredShares,
    revokedShares,
    pendingRequests,
    approvedRequests,
    printedSessions,
    expiredSessions,
    revokedSessions,
    activeSessions,
    securePrints: printTotals[0]?.total || 0,
    recentActivity,
  };
};

export const getDocumentById = async (
  ownerId: string,
  documentId: string
) => {
  return await Document.findOne({
    ownerId,
    documentId,
  });
};

export const deleteDocument = async (
  ownerId: string,
  documentId: string
) => {
  return await Document.findOneAndDelete({
    ownerId,
    documentId,
  });
};
