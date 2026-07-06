import { v4 as uuidv4 } from "uuid";

import Session from "../../../models/session.model";
import Share from "../../../models/share.model";

export const requestAccess = async (
    shareToken: string
) => {

    // Find the share
    const share = await Share.findOne({
        shareToken
    });

    if (!share) {
        throw new Error("Invalid Share Token");
    }

    // Create session
    const session = await Session.create({

        sessionId: `SES-${uuidv4().slice(0,8).toUpperCase()}`,

        shareId: share.shareId,

        ownerId: share.ownerId,

        status: "PENDING"

    });

    return session;

};