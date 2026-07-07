import { Response } from "express";
import { AuthRequest } from "../../../middleware/auth.middleware";

import { approveSession } from "../services/approve.service";
import { createAuditLog } from "../../../utils/audit";

export const approve = async (
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

        const session = await approveSession(
            sessionId,
            ownerId
        );

        // audit
        try {
            await createAuditLog({
                action: "APPROVE_ACCESS",
                userId: ownerId,
                documentId: session.documentId,
                shareId: session.shareId,
                sessionId,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"] as string | undefined,
            });
        } catch (e) {
            console.warn("Failed to create audit log for approve", e);
        }

        return res.status(200).json({

            success: true,

            message: "Session approved successfully",

            data: {
                sessionId: session.sessionId,
                status: session.status,
            }

        });

    } catch (error: any) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};
