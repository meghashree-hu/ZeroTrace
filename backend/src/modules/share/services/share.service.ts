import { v4 as uuidv4 } from "uuid";
import Share from "../../../models/share.model";
import Document from "../../../models/document.model";
import Session from "../../../models/session.model";
import User from "../../../models/user.model";
import { generateShareToken } from "../../../utils/token";
import { generateQRCode } from "../../../utils/qrcode";
import { createAuditLog } from "../../../utils/audit";
import { env } from "../../../config/env";

export const createShare = async (
  documentId: string,
  ownerId: string,
  options: {
    accessMode?: "VIEW_PRINT" | "PRINT_ONLY";
    expiryMinutes?: number;
    maxViews?: number;
    maxPrints?: number;
    downloadAllowed?: boolean;
    approvalRequired?: boolean;
    watermarkEnabled?: boolean;
    frontendOrigin?: string;
    autoRevokeAfterPrint?: boolean;
  }
) => {
  const token = generateShareToken();
  const expiryMinutes = Number(options.expiryMinutes || 15);
  const expiry = new Date(Date.now() + expiryMinutes * 60 * 1000);
  const frontendOrigin = (options.frontendOrigin || env.APP_URL).replace(/\/$/, "");

  if (!frontendOrigin) {
    const error = new Error("Frontend origin is required to generate a share link");
    (error as any).statusCode = 400;
    throw error;
  }

  const shareUrl = `${frontendOrigin}/share/${token}`;

  const document = await Document.findOne({ documentId, ownerId });
  if (!document) {
    const error = new Error("Document not found");
    (error as any).statusCode = 404;
    throw error;
  }

  if (document.status !== "ACTIVE") {
    const error = new Error("Only active documents can be shared");
    (error as any).statusCode = 403;
    throw error;
  }

  const share = await Share.create({
    shareId: `SHR-${uuidv4().slice(0, 8).toUpperCase()}`,
    documentId,
    ownerId,
    shareToken: token,
    status: "ACTIVE",
    expiresAt: expiry,
    accessMode: options.accessMode || "VIEW_PRINT",
    maxViews: Number(options.maxViews || 0),
    maxPrints: Number(options.maxPrints || 0),
    downloadAllowed: Boolean(options.downloadAllowed),
    approvalRequired: options.approvalRequired !== undefined ? Boolean(options.approvalRequired) : true,
    watermarkEnabled: options.watermarkEnabled !== undefined ? Boolean(options.watermarkEnabled) : true
  });

  const qrCode = await generateQRCode(shareUrl);

  try {
    await createAuditLog({
      action: "GENERATE_SHARE",
      userId: ownerId,
      documentId,
      shareId: share.shareId,
    });
    await createAuditLog({
      action: "QR_GENERATED",
      userId: ownerId,
      documentId,
      shareId: share.shareId,
    });
  } catch (e) {
    console.warn("Audit log failed for generate share", e);
  }

  return {
    share,
    shareUrl,
    qrCode
  };
};

export const expireShareAndDocumentIfNeeded = async (share: any) => {
  if (share.expiresAt >= new Date() && share.status !== "EXPIRED") return false;

  const newlyExpired = share.status !== "EXPIRED";

  if (share.status !== "EXPIRED") {
    share.status = "EXPIRED";
    await share.save();
  }

  await Document.findOneAndUpdate(
    { documentId: share.documentId },
    { status: "EXPIRED" }
  );

  await Session.updateMany(
    { shareId: share.shareId, status: { $in: ["REQUESTED", "APPROVED"] } },
    { status: "EXPIRED" }
  );

  if (newlyExpired) {
    try {
      await createAuditLog({
        action: "SHARE_EXPIRED",
        shareId: share.shareId,
        documentId: share.documentId,
      });
    } catch (e) {
      console.warn("Failed to audit share expiry", e);
    }
  }

  return true;
};

export const validateShareToken = async (shareToken: string, trackView = false) => {
  const share = await Share.findOne({ shareToken });
  if (!share) {
    const error = new Error("Share link not found or invalid");
    (error as any).statusCode = 404;
    throw error;
  }

  if (await expireShareAndDocumentIfNeeded(share)) {
    const error = new Error("This share link has expired.");
    (error as any).statusCode = 410;
    throw error;
  }

  if (share.status === "EXPIRED" || share.status === "REVOKED") {
    try {
      await createAuditLog({
        action: "SESSION_REVOKED",
        shareId: share.shareId,
        documentId: share.documentId,
      });
    } catch (e) {
      console.warn("Failed to audit share revoked", e);
    }

    const error = new Error("This share link is no longer active.");
    (error as any).statusCode = 403;
    throw error;
  }

  const document = await Document.findOne({ documentId: share.documentId });
  if (!document) {
    const error = new Error("Document deleted or no longer available.");
    (error as any).statusCode = 404;
    throw error;
  }

  if (document.status !== "ACTIVE") {
    const error = new Error(document.status === "EXPIRED"
      ? "This shared document has expired."
      : "Document deleted or no longer available.");
    (error as any).statusCode = 403;
    throw error;
  }

  const owner = await User.findOne({ userId: share.ownerId }).lean();

  if (trackView) {
    if ((share.maxViews || 0) > 0) {
      const viewTotals = await Session.aggregate([
        { $match: { shareId: share.shareId } },
        { $group: { _id: null, total: { $sum: "$viewCount" } } },
      ]);
      const currentViews = viewTotals[0]?.total || 0;
      if (currentViews >= (share.maxViews || 0)) {
      share.status = "REVOKED";
      await share.save();
      await Session.updateMany(
        { shareId: share.shareId, status: { $in: ["REQUESTED", "APPROVED"] } },
        { status: "REJECTED" }
      );
      const error = new Error("View limit reached for this secure share.");
      (error as any).statusCode = 403;
      throw error;
      }
    }

    await createAuditLog({
      action: "LINK_OPENED",
      documentId: share.documentId,
      shareId: share.shareId,
    });
  }

  return {
    share: {
      shareId: share.shareId,
      shareToken: share.shareToken,
      status: share.status,
      expiresAt: share.expiresAt,
      documentId: share.documentId,
      ownerId: share.ownerId,
      ownerName: owner?.fullName || "",
      ownerEmail: owner?.email || "",
      accessMode: share.accessMode || "VIEW_PRINT",
      maxViews: share.maxViews || 0,
      maxPrints: share.maxPrints || 0,
      viewsUsed: 0,
      printsUsed: 0,
      downloadAllowed: Boolean(share.downloadAllowed),
      approvalRequired: share.approvalRequired !== false,
      watermarkEnabled: share.watermarkEnabled !== false,
      autoRevokeAfterPrint: false
    },
    document: {
      documentId: document.documentId,
      originalFileName: document.originalFileName,
      mimeType: document.mimeType,
      fileSize: document.fileSize,
      status: document.status,
      uploadedAt: document.uploadedAt
    }
  };
};

export const getShareHistoryForOwner = async (ownerId: string) => {
  const shares = await Share.find({ ownerId }).sort({ createdAt: -1 }).lean();

  return Promise.all(
    shares.map(async (share: any) => {
      const liveShare = await Share.findOne({ shareId: share.shareId });
      if (liveShare) {
        await expireShareAndDocumentIfNeeded(liveShare);
        share.status = liveShare.status;
      }

      const sessions = await Session.find({ shareId: share.shareId }).lean();
      const document = await Document.findOne({ documentId: share.documentId }).lean();
      const latestSession: any = sessions
        .slice()
        .sort((a: any, b: any) => new Date(b.updatedAt || b.requestedAt).getTime() - new Date(a.updatedAt || a.requestedAt).getTime())[0];

      return {
        shareId: share.shareId,
        documentId: share.documentId,
        documentName: document?.originalFileName || "Unknown Document",
        status: share.status,
        viewsUsed: sessions.reduce((sum: number, session: any) => sum + (session.viewCount || 0), 0),
        printsUsed: sessions.reduce((sum: number, session: any) => sum + (session.printCount || 0), 0),
        createdTime: share.createdAt,
        expiryTime: share.expiresAt,
        lastAccess: latestSession?.lastAccessAt || latestSession?.updatedAt || "",
        device: latestSession?.deviceInfo || {},
        ip: latestSession?.ipAddress || "",
      };
    })
  );
};

export const revokeShareForOwner = async (ownerId: string, shareId: string) => {
  const share = await Share.findOne({ ownerId, shareId });
  if (!share) throw new Error("Share not found");

  share.status = "REVOKED";
  await share.save();
  await Document.findOneAndUpdate({ documentId: share.documentId, ownerId }, { status: "REVOKED" });
  await Session.updateMany(
    { shareId: share.shareId, status: { $in: ["REQUESTED", "APPROVED"] } },
    { status: "REJECTED" }
  );

  await createAuditLog({
    action: "REVOKE_SHARE",
    userId: ownerId,
    documentId: share.documentId,
    shareId: share.shareId,
  });

  return share;
};

export const extendShareExpiryForOwner = async (ownerId: string, shareId: string, expiryMinutes: number) => {
  const share = await Share.findOne({ ownerId, shareId });
  if (!share) throw new Error("Share not found");

  share.expiresAt = new Date(Date.now() + Number(expiryMinutes || 15) * 60 * 1000);
  if (share.status === "EXPIRED") share.status = "ACTIVE";
  await share.save();
  await Document.findOneAndUpdate({ documentId: share.documentId, ownerId, status: "EXPIRED" }, { status: "ACTIVE" });
  await Session.updateMany(
    { shareId: share.shareId, status: { $ne: "REJECTED" } },
    { expiresAt: share.expiresAt }
  );

  await createAuditLog({
    action: "EXTEND_SHARE_EXPIRY",
    userId: ownerId,
    documentId: share.documentId,
    shareId: share.shareId,
  });

  return share;
};
