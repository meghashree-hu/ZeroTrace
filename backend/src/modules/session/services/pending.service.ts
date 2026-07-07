import Session from "../../../models/session.model";
import Share from "../../../models/share.model";
import Document from "../../../models/document.model";

const formatFingerprint = (fingerprint?: string) => {
  if (!fingerprint) return "";

  let hash = 0;
  for (let i = 0; i < fingerprint.length; i += 1) {
    hash = (hash << 5) - hash + fingerprint.charCodeAt(i);
    hash |= 0;
  }

  return `FP-${Math.abs(hash).toString(16).toUpperCase().padStart(8, "0").slice(0, 8)}`;
};

export const getPendingSessions = async (ownerId: string) => {
  const sessions = await Session.find({
    ownerId,
    status: "PENDING",
  }).lean();

  const results = await Promise.all(
    sessions.map(async (session) => {
      const share = await Share.findOne({
        shareId: session.shareId,
      }).lean();

      const document = await Document.findOne({
        documentId: share?.documentId,
      }).lean();

      return {
        sessionId: session.sessionId,
        documentName: document?.originalFileName || "Unknown Document",
        documentId: session.documentId,
        status: session.status,
        createdAt: session.requestedAt,
        requestTime: session.requestedAt,
        requestTimestamp: session.requestedAt,
        fingerprint: formatFingerprint(session.deviceFingerprint),
        deviceFingerprint: formatFingerprint(session.deviceFingerprint),
        deviceInfo: session.deviceInfo || {},
        browser: (session.deviceInfo as any)?.browser || "",
        operatingSystem: (session.deviceInfo as any)?.operatingSystem || "",
        deviceType: (session.deviceInfo as any)?.deviceType || "",
        ipAddress: session.ipAddress || "",
      };
    })
  );

  return results;
};
