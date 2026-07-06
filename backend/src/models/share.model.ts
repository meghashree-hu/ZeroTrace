import mongoose, { Schema, Document } from "mongoose";

export interface IShare extends Document {

  shareId: string;

  documentId: string;

  ownerId: string;

  shareToken: string;

  status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";

  expiresAt: Date;

}

const ShareSchema = new Schema<IShare>(

{

  shareId: {

    type: String,

    required: true,

    unique: true

  },

  documentId: {

    type: String,

    required: true

  },

  ownerId: {

    type: String,

    required: true

  },

  shareToken: {

    type: String,

    required: true,

    unique: true

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

  expiresAt: {

    type: Date,

    required: true

  }

},

{

  timestamps: true

}

);

export default mongoose.model<IShare>(

  "Share",

  ShareSchema

);