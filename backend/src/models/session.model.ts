import mongoose, { Document, Schema } from "mongoose";

export interface ISession extends Document {

    sessionId: string;

    shareId: string;

    documentId: string;

    ownerId: string;

    requesterEmail?: string;

    status:
    | "CREATED"
    | "REQUESTED"
    | "APPROVED"
    | "PRINTING"
    | "COMPLETED"
    | "REJECTED"
    | "REVOKED"
    | "EXPIRED";

    requestedAt: Date;

    approvedAt?: Date;

    expiresAt?: Date;
    printCount?: number;
    
    deviceFingerprint?: string;
    deviceInfo?: any;
    ipAddress?: string;
    lastAccessAt?: Date;

}

const SessionSchema = new Schema<ISession>(

{

    sessionId: {

        type: String,

        required: true,

        unique: true

    },

    shareId: {

        type: String,

        required: true

    },

    documentId: {

        type: String,

        required: true

    },

    ownerId: {

        type: String,

        required: true

    },

    requesterEmail: {

        type: String,

        default: ""

    },
    printCount: {
        type: Number,
        default: 0
    },
    
    deviceFingerprint: {
        type: String,
        default: ""
    },
    deviceInfo: {
        type: Schema.Types.Mixed,
        default: {}
    },
    ipAddress: {
        type: String,
        default: ""
    },
    lastAccessAt: Date,

    status: {

        type: String,

        enum: [
    "CREATED",
    "REQUESTED",
    "APPROVED",
    "PRINTING",
    "COMPLETED",
    "REJECTED",
    "REVOKED",
    "EXPIRED"
],
default: "CREATED"

    },

    requestedAt: {

        type: Date,

        default: Date.now

    },

    approvedAt: Date,

    expiresAt: Date

},

{

    timestamps: true

}

);

export default mongoose.model<ISession>(

    "Session",

    SessionSchema

);
