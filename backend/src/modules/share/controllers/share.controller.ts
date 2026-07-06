import { Request, Response } from "express";
import { createShare } from "../services/share.service";

export const generateShare = async (
  req: Request,
  res: Response
) => {

  try {

    const { documentId, ownerId } = req.body;

    const result = await createShare(
    documentId,
    ownerId
);

    return res.status(201).json({

      success: true,

      message: "Share created successfully",

      data: result

    });

  } catch (error: any) {

    return res.status(500).json({

      success: false,

      message: error.message

    });

  }

};