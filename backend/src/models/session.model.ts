import mongoose, { Document, Schema } from "mongoose";

export interface ISession extends Document {

    sessionId: string;

    shareId: string;

    ownerId: string;

    status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";

    requestedAt: Date;

    approvedAt?: Date;

    expiresAt?: Date;

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

    ownerId: {

        type: String,

        required: true

    },

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