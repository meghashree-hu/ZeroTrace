import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import Share from "../../../models/share.model";
import Session from "../../../models/session.model";
import Document from "../../../models/document.model";
import { createAuditLog } from "../../../utils/audit";
import { validateShareToken } from "../services/share.service";
import { getClientIp } from "../../../utils/getClientIp";

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
      status: "APPROVED",
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

    const maxPrints = share.maxPrints || 0;
    if (maxPrints > 0 && (share.printsUsed || 0) >= maxPrints) {
      share.status = "REVOKED";
      await share.save();
      session.status = "REVOKED";
      await session.save();
      return res.status(403).json({
        success: false,
        message: "Print limit exceeded for this shared document.",
      });
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

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Document deleted or no longer available.",
      });
    }

    session.status = "PRINTING";
    session.printCount = (session.printCount || 0) + 1;
    session.lastAccessAt = new Date();
    session.ipAddress = getClientIp(req) || session.ipAddress || "";
    share.printsUsed = (share.printsUsed || 0) + 1;
    await Promise.all([session.save(), share.save()]);

    await createAuditLog({
  action: "PRINT_STARTED",
  userId: session.ownerId,
  documentId: session.documentId,
  shareId: session.shareId,
  sessionId: session.sessionId,
  ipAddress: getClientIp(req),
  userAgent: req.headers["user-agent"] as string | undefined,
});

    const fileStream = fs.createReadStream(filePath);

    fileStream.on("close", async () => {
      try {
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

        if (share.autoRevokeAfterPrint !== false || (maxPrints > 0 && (share.printsUsed || 0) >= maxPrints)) {
          share.status = "REVOKED";
          await share.save();
          await Session.updateMany(
            { shareId: share.shareId, status: { $in: ["CREATED", "REQUESTED", "APPROVED", "PRINTING"] } },
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
