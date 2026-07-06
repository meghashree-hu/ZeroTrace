import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface JwtPayload {
  id: string;
  role: string;
}

export const generateAccessToken = (
  userId: string,
  role: string
) => {
  return jwt.sign(
    {
      id: userId,
      role,
    },
    env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

export const generateRefreshToken = (
  userId: string,
  role: string
) => {
  return jwt.sign(
    {
      id: userId,
      role,
    },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
};