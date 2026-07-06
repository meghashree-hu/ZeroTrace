import mongoose, { Document, Schema } from "mongoose";

export interface IPolicy extends Document {
  policyId: string;
  documentId: string;

  accessMode: "VIEW_PRINT" | "PRINT_ONLY";

  expiryMinutes: number;

  maxViews: number;

  maxPrints: number;

  downloadAllowed: boolean;

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

    accessMode: {
      type: String,
      enum: ["VIEW_PRINT", "PRINT_ONLY"],
      required: true,
    },

    expiryMinutes: {
      type: Number,
      default: 15,
    },

    maxViews: {
      type: Number,
      default: 0,
    },

    maxPrints: {
      type: Number,
      default: 1,
    },

    downloadAllowed: {
      type: Boolean,
      default: false,
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