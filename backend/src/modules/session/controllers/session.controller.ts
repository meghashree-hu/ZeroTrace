import { Request, Response } from "express";

import { requestAccess } from "../services/session.service";
import { createAuditLog } from "../../../utils/audit";

export const createSession = async (
    req: Request,
    res: Response
) => {
    try {
        const { shareToken, deviceFingerprint, deviceInfo } = req.body as any;

        if (!shareToken) {
            return res.status(400).json({
                success: false,
                message: "shareToken is required",
            });
        }

        if (!deviceFingerprint) {
            return res.status(400).json({
                success: false,
                message: "Device fingerprint is required",
            });
        }

        const session = await requestAccess(shareToken, deviceFingerprint, deviceInfo, req.ip || "");

        try {
            await createAuditLog({
                action: "REQUEST_SENT",
                documentId: session.documentId,
                shareId: session.shareId,
                sessionId: session.sessionId,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"] as string | undefined,
            });
        } catch (e) {
            console.warn("Failed to create audit log for request access", e);
        }

        return res.status(201).json({
            success: true,
            message: "Print request submitted.",
            data: {
                sessionId: session.sessionId,
                status: session.status,
            },
        });
    } catch (error: any) {
        return res.status((error as any).statusCode || 400).json({
            success: false,
            message: error.message
        });
    }
};
