import Session from "../../../models/session.model";

export const approveSession = async (
    sessionId: string
) => {

    const session = await Session.findOne({
        sessionId
    });

    if (!session) {
        throw new Error("Session not found");
    }

    session.status = "APPROVED";

    session.approvedAt = new Date();

    const expiry = new Date();

    expiry.setMinutes(expiry.getMinutes() + 15);

    session.expiresAt = expiry;

    await session.save();

    return session;
};