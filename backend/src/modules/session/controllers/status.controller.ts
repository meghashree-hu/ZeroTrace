import { Request, Response } from "express";
import Session from "../../../models/session.model";
import { validateShareToken } from "../../share/services/share.service";
import { createAuditLog } from "../../../utils/audit";

export const getSessionStatus = async (req: Request, res: Response) => {
  try {
    const shareToken = Array.isArray(req.params.shareToken)
      ? req.params.shareToken[0]
      : req.params.shareToken;
    const sessionId = typeof req.query.sessionId === "string" ? req.query.sessionId : "";
    const deviceFingerprint = (req.headers["x-device-fingerprint"] as string) || "";

    if (!shareToken || !sessionId || !deviceFingerprint) {
      return res.status(400).json({
        success: false,
        message: "Share token, sessionId and device fingerprint are required",
      });
    }

    const shareData = await validateShareToken(shareToken);
    const shareId = shareData.share.shareId;

    const session = await Session.findOne({ shareId, sessionId, deviceFingerprint }).sort({ requestedAt: -1 });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (session.expiresAt && session.expiresAt < new Date() && session.status !== "EXPIRED") {
      session.status = "EXPIRED";
      await session.save();

      try {
        await createAuditLog({
          action: "EXPIRED",
          sessionId: session.sessionId,
          shareId: session.shareId,
          documentId: session.documentId,
        });
      } catch (e) {
        console.warn("Failed to audit session expiry", e);
      }
    }

    return res.status(200).json({
      success: true,
      status: session.status,
      sessionId: session.sessionId,
      printCount: session.printCount || 0,
    });
  } catch (error: any) {
    const status = (error as any).statusCode || 400;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

export default getSessionStatus;
