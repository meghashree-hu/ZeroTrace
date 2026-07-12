import { Response } from "express";
import type { AuthRequest } from "../../../middleware/auth.middleware";
import AuditLog from "../../../models/activityLog.model";
import User from "../../../models/user.model";
import Document from "../../../models/document.model";


export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const logs = await AuditLog.find({
  userId: req.user?.id,
})
  .sort({ createdAt: -1 })
  .limit(200);

    // enrich logs with user email and document name when available
    const enriched = await Promise.all(
      logs.map(async (l) => {
        const user = l.userId ? await User.findOne({ userId: l.userId }) : null;
        const doc = l.documentId ? await Document.findOne({ documentId: l.documentId }) : null;

        return {
          logId: l.logId,
          action: l.action,
          status: l.action,
          timestamp: l.timestamp,
          documentId: l.documentId,
          documentName: doc?.originalFileName || "",
          userId: l.userId,
          userEmail: user?.email || "",
          ipAddress: l.ipAddress,
          userAgent: l.userAgent,
        };
      })
    );

    return res.status(200).json({ success: true, data: enriched });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default getAuditLogs;
