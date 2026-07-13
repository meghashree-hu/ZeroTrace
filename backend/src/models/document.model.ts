import mongoose, { Document, Schema } from "mongoose";

export interface IDocument extends Document {

    documentId: string;

    ownerId: string;

    originalFileName: string;

    mimeType: string;

    fileSize: number;

    s3Key: string;

    encryptionIV: string;

    encryptedAESKey: string;

    authenticationTag: string;

    uploadedAt: Date;

    status: string;
}
const DocumentSchema = new Schema<IDocument>(

{

    documentId: {

        type: String,

        required: true,

        unique: true

    },

    ownerId: {

        type: String,

        required: true

    },

    originalFileName: {

        type: String,

        required: true

    },

    mimeType: {

    type: String,

    required: true

},
    status: {

    type: String,

    enum: [

        "UPLOADED",

        "ENCRYPTED",

        "ACTIVE",

        "REVOKED",

        "EXPIRED"

    ],

    default: "UPLOADED"

},

    
    fileSize: {

        type: Number,

        required: true

    },

    s3Key: {

        type: String,

        default: ""

    },

    encryptionIV: {

        type: String,

        default: ""

    },

    encryptedAESKey: {

        type: String,

        default: ""

    },
    authenticationTag: {

    type: String,

    default: ""

},


    uploadedAt: {

        type: Date,

        default: Date.now

    }

},

{

    timestamps: true

}

);

export default mongoose.model<IDocument>(
    "Document",
    DocumentSchema
);