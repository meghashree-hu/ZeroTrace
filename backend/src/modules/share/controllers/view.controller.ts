import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import Share from "../../../models/share.model";
import Session from "../../../models/session.model";
import Document from "../../../models/document.model";
import { createAuditLog } from "../../../utils/audit";
import { validateShareToken } from "../services/share.service";
import { getClientIp } from "../../../utils/getClientIp";
import { watermarkPdf, watermarkImage } from "../../../utils/watermark";
import { createSecurePrintCopy } from "../../../utils/securePrint";

export const viewSharedDocument = async (req: Request, res: Response) => {
  try {
    const shareToken = Array.isArray(req.params.shareToken)
      ? req.params.shareToken[0]
      : req.params.shareToken;
    const incomingFingerprint = (req.headers["x-device-fingerprint"] as string) || "";
    const incomingSessionId = (req.headers["x-session-id"] as string) || "";

    if (!shareToken || !incomingSessionId || !incomingFingerprint) {
      return res.status(400).json({
        success: false,
        message: "Share token, session and device fingerprint are required",
      });
    }

    const shareData = await validateShareToken(shareToken);
    const shareId = shareData.share.shareId;

    const session = await Session.findOne({
  sessionId: incomingSessionId,
  shareId,
  deviceFingerprint: incomingFingerprint,
  status: {
    $in: ["APPROVED", "PRINTING", "COMPLETED"],
  },
}).sort({ approvedAt: -1 });

    if (!session) {
      return res.status(403).json({
        success: false,
        message: "Approval pending. Please wait for the owner to approve access.",
      });
    }

    if (session.expiresAt && session.expiresAt < new Date()) {
      session.status = "EXPIRED";
      await session.save();
      await createAuditLog({
  action: "EXPIRED",
  userId: session.ownerId,
  sessionId: session.sessionId,
  shareId: session.shareId,
  documentId: session.documentId,
  ipAddress: getClientIp(req),
  userAgent: req.headers["user-agent"] as string | undefined,
});

      return res.status(410).json({
        success: false,
        message: "Your approved session has expired. Please request access again.",
      });
    }

    const share = await Share.findOne({ shareId: session.shareId });
    if (!share || share.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "This secure share is no longer active.",
      });
    }
const activeShare = share!;
    const maxPrints = share.maxPrints || 0;
console.log("========== PRINT DEBUG ==========");
console.log("maxPrints:", maxPrints);
console.log("printsUsed:", activeShare.printsUsed);
console.log("shareStatus:", activeShare.status);
console.log("================================");
// Block any print after the configured limit
if (maxPrints > 0) {
  const printsUsed = share.printsUsed || 0;

  if (printsUsed >= maxPrints) {
    activeShare.status = "REVOKED";
    session.status = "REVOKED";

    await Promise.all([
      activeShare.save(),
      session.save(),
    ]);

    return res.status(403).json({
      success: false,
      message: `Maximum print limit (${maxPrints}) has been reached.`,
    });
  }
}
    const document = await Document.findOne({
      documentId: session.documentId,
      ownerId: session.ownerId,
    }).lean();

    if (!document || document.status === "REVOKED" || !document.s3Key) {
      return res.status(404).json({
        success: false,
        message: "Document deleted or no longer available.",
      });
    }

    if (document.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: document.status === "EXPIRED"
          ? "This shared document has expired."
          : "Document deleted or no longer available.",
      });
    }

    const uploadsDir = path.join(__dirname, "../../../../uploads");
    const filePath = path.join(uploadsDir, path.basename(document.s3Key));
    const watermarkData = {
  owner: shareData.share.ownerEmail,
  shareId: share.shareId,
  sessionId: session.sessionId,
  ip: getClientIp(req) || "",
  timestamp: new Date().toLocaleString(),
};

const secureFilePath = await createSecurePrintCopy(
  filePath,
  document.mimeType,
  watermarkData,
  session.sessionId
);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Document deleted or no longer available.",
      });
    }
// Count document view



    session.status = "PRINTING";
    session.printCount = (session.printCount || 0) + 1;
    session.lastAccessAt = new Date();
    session.ipAddress = getClientIp(req) || session.ipAddress || "";
    activeShare.printsUsed = (activeShare.printsUsed || 0) + 1;
    await Promise.all([
  session.save(),
  activeShare.save(),
]);

    await createAuditLog({
  action: "PRINT_STARTED",
  userId: session.ownerId,
  documentId: session.documentId,
  shareId: session.shareId,
  sessionId: session.sessionId,
  ipAddress: getClientIp(req),
  userAgent: req.headers["user-agent"] as string | undefined,
});
const fileBuffer = fs.readFileSync(filePath);

    const fileStream = fs.createReadStream(secureFilePath);

    fileStream.on("close", async () => {
      try {
        if (fs.existsSync(secureFilePath)) {
  fs.unlinkSync(secureFilePath);
}
        session.status = "COMPLETED";
        await session.save();

        await createAuditLog({
  action: "PRINT_COMPLETED",
  userId: session.ownerId,
  documentId: session.documentId,
  shareId: session.shareId,
  sessionId: session.sessionId,
  ipAddress: getClientIp(req),
  userAgent: req.headers["user-agent"] as string | undefined,
});

        if (
  maxPrints > 0 &&
  (activeShare.printsUsed || 0) >= maxPrints
){
          activeShare.status = "REVOKED";
          await activeShare.save();
          await Session.updateMany(
            { shareId: activeShare.shareId, status: { $in: ["CREATED", "REQUESTED", "APPROVED", "PRINTING"] } },
            { status: "REVOKED" }
          );
          await createAuditLog({
  action: "REVOKED",
  userId: session.ownerId,
  documentId: session.documentId,
  shareId: session.shareId,
  sessionId: session.sessionId,
  ipAddress: getClientIp(req),
  userAgent: req.headers["user-agent"] as string | undefined,
});
        }
      } catch (e) {
        console.warn("Failed to complete secure print lifecycle", e);
      }
    });

    res.setHeader("Content-Type", document.mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${document.originalFileName}"`);

    fileStream.pipe(res);
  } catch (error: any) {
    const status = (error as any).statusCode || 400;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

export default viewSharedDocument;
