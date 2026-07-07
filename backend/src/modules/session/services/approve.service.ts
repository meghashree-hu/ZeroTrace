import Session from "../../../models/session.model";
import Share from "../../../models/share.model";

export const approveSession = async (
    sessionId: string,
    ownerId: string
) => {

    const session = await Session.findOne({
        sessionId
    });

    if (!session) {
        throw new Error("Session not found");
    }

    if (session.ownerId !== ownerId) {
        throw new Error("Unauthorized");
    }

    const share = await Share.findOne({ shareId: session.shareId });
    if (!share) {
        throw new Error("Share not found");
    }

    if (share.expiresAt < new Date() || share.status === "EXPIRED" || share.status === "REVOKED") {
        throw new Error("Share is not active");
    }

    session.status = "APPROVED";

    session.approvedAt = new Date();

    session.expiresAt = share.expiresAt;

    await session.save();

    return session;
};
