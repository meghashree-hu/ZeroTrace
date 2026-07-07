import { Request, Response } from "express";
import { AuthRequest } from "../../../middleware/auth.middleware";
import {
  createShare,
  extendShareExpiryForOwner,
  getShareHistoryForOwner,
  revokeShareForOwner,
  validateShareToken,
} from "../services/share.service";

export const generateShare = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      documentId,
      accessMode,
      expiryMinutes,
      maxViews,
      maxPrints,
      downloadAllowed,
      approvalRequired,
      watermarkEnabled,
      autoRevokeAfterPrint,
      frontendOrigin,
    } = req.body;
    const ownerId = req.user!.id;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: "documentId is required",
      });
    }

    const result = await createShare(documentId, ownerId, {
      accessMode,
      expiryMinutes,
      maxViews,
      maxPrints,
      downloadAllowed,
      approvalRequired,
      watermarkEnabled,
      autoRevokeAfterPrint,
      frontendOrigin,
    });

    return res.status(201).json({
      success: true,
      message: "Share created successfully",
      data: result
    });
  } catch (error: any) {
    return res.status((error as any).statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const getShareHistory = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const data = await getShareHistoryForOwner(req.user!.id);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const revokeShare = async (
  req: AuthRequest<{ shareId: string }>,
  res: Response
) => {
  try {
    await revokeShareForOwner(req.user!.id, req.params.shareId);

    return res.status(200).json({
      success: true,
      message: "Share revoked successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const extendShareExpiry = async (
  req: AuthRequest<{ shareId: string }>,
  res: Response
) => {
  try {
    const { expiryMinutes } = req.body;
    const share = await extendShareExpiryForOwner(req.user!.id, req.params.shareId, Number(expiryMinutes || 15));

    return res.status(200).json({
      success: true,
      message: "Share expiry extended successfully",
      data: share,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const validateShareLink = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const shareToken = Array.isArray(req.params.shareToken) ? req.params.shareToken[0] : req.params.shareToken;
    const result = await validateShareToken(shareToken, true);

    return res.status(200).json({
      success: true,
      message: "Share link is valid",
      data: result
    });
  } catch (error: any) {
    const status = (error as any).statusCode || 400;
    return res.status(status).json({
      success: false,
      message: error.message
    });
  }
};
