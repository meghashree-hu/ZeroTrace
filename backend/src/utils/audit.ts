import { v4 as uuidv4 } from "uuid";
import AuditLog from "../models/activityLog.model";

type AuditParams = {
  action: string;
  userId?: string;
  documentId?: string;
  shareId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
};

export const createAuditLog = async (params: AuditParams) => {
  const log = await AuditLog.create({
    logId: `LOG-${uuidv4().slice(0, 8).toUpperCase()}`,
    action: params.action,
    userId: params.userId || "",
    documentId: params.documentId || "",
    shareId: params.shareId || "",
    sessionId: params.sessionId || "",
    ipAddress: params.ipAddress || "",
    userAgent: params.userAgent || "",
  });

  return log;
};

export default createAuditLog;
