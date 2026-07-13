import mongoose, { Schema, Document } from "mongoose";

export interface IShare extends Document {

  shareId: string;

  documentId: string;

  ownerId: string;

  shareToken: string;

  status: "REQUESTED" | "ACTIVE" | "APPROVED" | "REJECTED" | "REVOKED" | "EXPIRED";

  expiresAt: Date;

  printsUsed?: number;

 

  

  

  maxPrints?: number;

  

  approvalRequired?: boolean;

  watermarkEnabled?: boolean;

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

      "REQUESTED",

      "ACTIVE",

      "APPROVED",

      "REJECTED",

      "REVOKED",

      "EXPIRED"

    ],

    default: "ACTIVE"

  },

  expiresAt: {

    type: Date,

    required: true

  },

  

  

  

  maxPrints: {
    type: Number,
    default: 0
  },
  printsUsed: {
    type: Number,
    default: 0
},

 

  approvalRequired: {
    type: Boolean,
    default: true
  },

  watermarkEnabled: {
    type: Boolean,
    default: true
  },
  

},

{

  timestamps: true

}

);

export default mongoose.model<IShare>(

  "Share",

  ShareSchema

);
