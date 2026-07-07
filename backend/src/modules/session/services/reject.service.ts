import Session from "../../../models/session.model";

export const rejectSession = async (
    sessionId: string,
    ownerId: string
) => {
    const session = await Session.findOne({
        sessionId,
    });

    if (!session) {
        throw new Error("Session not found");
    }

    if (session.ownerId !== ownerId) {
        throw new Error("Unauthorized");
    }

    session.status = "REJECTED";

    await session.save();
};
