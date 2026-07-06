import { Request, Response } from "express";

import { approveSession } from "../services/approve.service";

export const approve = async (
    req: Request,
    res: Response
) => {

    try {

        const { sessionId } = req.body;

        const session = await approveSession(
            sessionId
        );

        return res.status(200).json({

            success: true,

            message: "Session approved",

            data: session

        });

    } catch (error: any) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};