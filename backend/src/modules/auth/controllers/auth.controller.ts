import { Request, Response } from "express";
import { validationResult } from "express-validator";
import {
  registerUser,
  loginUser,
} from "../services/auth.service";

export const register = async (
  req: Request,
  res: Response
) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  try {

    const { name, email, password } = req.body;

    await registerUser(name, email, password);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
    });

  } catch (error: any) {
    if (error.message === "User already exists") {
      return res.status(409).json({ success: false, message: error.message });
    }

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }

};
export const login = async (req: Request, res: Response) => {
    const errors = validationResult(req);

if (!errors.isEmpty()) {
    return res.status(400).json({
        errors: errors.array(),
    });
}
  try {
    const { email, password } = req.body;

    const result = await loginUser(email, password);

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      data: result,
    });

  } catch (error: any) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};
import { AuthRequest } from "../../../middleware/auth.middleware";

export const profile = async (
  req: AuthRequest,
  res: Response
) => {

  return res.status(200).json({
    success: true,
    message: "Protected Route Accessed Successfully",
    user: req.user,
  });

};