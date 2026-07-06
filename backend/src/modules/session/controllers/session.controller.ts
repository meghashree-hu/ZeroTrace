import { Request, Response } from "express";

import { requestAccess } from "../services/session.service";

export const createSession = async (
    req: Request,
    res: Response
) => {

    try {

        const { shareToken } = req.body;

        const session = await requestAccess(
            shareToken
        );

        return res.status(201).json({

            success: true,

            message: "Access request created",

            data: session

        });

    } catch (error: any) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};