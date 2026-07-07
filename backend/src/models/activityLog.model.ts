import mongoose, { Document, Schema } from "mongoose";

export interface IAuditLog extends Document {
	logId: string;
	userId?: string;
	documentId?: string;
	shareId?: string;
	sessionId?: string;
	action: string;
	ipAddress?: string;
	userAgent?: string;
	timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
	{
		logId: { type: String, required: true, unique: true },
		userId: { type: String, default: "" },
		documentId: { type: String, default: "" },
		shareId: { type: String, default: "" },
		sessionId: { type: String, default: "" },
		action: { type: String, required: true },
		ipAddress: { type: String, default: "" },
		userAgent: { type: String, default: "" },
		timestamp: { type: Date, default: Date.now },
	},
	{ timestamps: true }
);

export default mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
