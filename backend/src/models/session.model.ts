import mongoose, { Document, Schema } from "mongoose";

export interface ISession extends Document {

    sessionId: string;

    shareId: string;

    documentId: string;

    ownerId: string;

    requesterEmail?: string;

    status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";

    requestedAt: Date;

    approvedAt?: Date;

    expiresAt?: Date;
    printCount?: number;
    viewCount?: number;
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
    viewCount: {
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

            "PENDING",

            "APPROVED",

            "REJECTED",

            "EXPIRED"

        ],

        default: "PENDING"

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
