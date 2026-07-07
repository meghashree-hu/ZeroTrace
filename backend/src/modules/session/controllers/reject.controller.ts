import { Response } from "express";
import { AuthRequest } from "../../../middleware/auth.middleware";

import { rejectSession } from "../services/reject.service";
import { createAuditLog } from "../../../utils/audit";

export const reject = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const { sessionId } = req.params;
        const ownerId = req.user?.id;

        if (!ownerId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        await rejectSession(sessionId, ownerId);

        try {
            await createAuditLog({
                action: "REJECT_ACCESS",
                userId: ownerId,
                sessionId,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"] as string | undefined,
            });
        } catch (e) {
            console.warn("Failed to create audit log for reject", e);
        }

        return res.status(200).json({
            success: true,
            message: "Session rejected successfully",
        });
    } catch (error: any) {
        const statusCode = error.message === "Session not found" ? 404 : 400;
        return res.status(statusCode).json({
            success: false,
            message: error.message,
        });
    }
};
