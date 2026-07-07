import { v4 as uuidv4 } from "uuid";

import Session from "../../../models/session.model";
import { validateShareToken } from "../../share/services/share.service";

export const requestAccess = async (
    shareToken: string,
    deviceFingerprint: string,
    deviceInfo?: any,
    ipAddress?: string
) => {
    const data = await validateShareToken(shareToken);
    const share = data.share;

    const existingSession = await Session.findOne({
        shareId: share.shareId,
        deviceFingerprint,
        status: { $in: ["PENDING", "APPROVED"] },
    }).sort({ requestedAt: -1 });

    if (existingSession) {
        existingSession.deviceInfo = deviceInfo || existingSession.deviceInfo || {};
        existingSession.ipAddress = ipAddress || existingSession.ipAddress || "";
        await existingSession.save();
        return existingSession;
    }

    return await Session.create({
        sessionId: `SES-${uuidv4().slice(0, 8).toUpperCase()}`,
        shareId: share.shareId,
        documentId: share.documentId,
        ownerId: share.ownerId,
        requesterEmail: "",
        status: "PENDING",
        deviceFingerprint,
        deviceInfo: deviceInfo || {},
        ipAddress: ipAddress || "",
        expiresAt: share.expiresAt
    });
};
