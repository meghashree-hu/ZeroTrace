import { v4 as uuidv4 } from "uuid";
import Share from "../../../models/share.model";
import { generateShareToken } from "../../../utils/token";
import { generateQRCode } from "../../../utils/qrcode";

export const createShare = async (
  documentId: string,
  ownerId: string
) => {

  // 1. Generate token FIRST
  const token = generateShareToken();

  // 2. Generate expiry
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 15);

  // 3. Save share
  const share = await Share.create({

    shareId: `SHR-${uuidv4().slice(0,8).toUpperCase()}`,

    documentId,

    ownerId,

    shareToken: token,

    expiresAt: expiry

  });

  // 4. Generate QR AFTER token exists
  const qrCode = await generateQRCode(token);

  return {
    share,
    qrCode
  };

};