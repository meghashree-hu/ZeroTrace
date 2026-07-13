import mongoose, { Document, Schema } from "mongoose";

export interface IPolicy extends Document {
  policyId: string;
  documentId: string;

  

  expiryMinutes: number;

 

  maxPrints: number;

  

  approvalRequired: boolean;

  watermarkEnabled: boolean;

  isActive: boolean;
}

const PolicySchema = new Schema<IPolicy>(
  {
    policyId: {
      type: String,
      required: true,
      unique: true,
    },

    documentId: {
      type: String,
      required: true,
    },

   

    expiryMinutes: {
      type: Number,
      default: 15,
    },

   

    maxPrints: {
      type: Number,
      default: 1,
    },

    

    approvalRequired: {
      type: Boolean,
      default: true,
    },

    watermarkEnabled: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPolicy>("Policy", PolicySchema);