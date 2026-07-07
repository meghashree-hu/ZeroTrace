import { Response } from "express";
import { AuthRequest } from "../../../middleware/auth.middleware";

import { getPendingSessions } from "../services/pending.service";

export const getPendingRequests = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const ownerId = req.user?.id;

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const data = await getPendingSessions(ownerId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
