import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import User from "../../../models/user.model";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../../utils/jwt";


export const registerUser = async (
  fullName: string,
  email: string,
  password: string
) => {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    userId: `USR-${uuidv4().slice(0,8).toUpperCase()}`,
    fullName,
    email: normalizedEmail,
    password: hashedPassword
  });

  return newUser;
};
export const loginUser = async (
  email: string,
  password: string
) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordCorrect) {
    throw new Error("Invalid email or password");
  }
  const accessToken = generateAccessToken(
  user.userId,
  user.role
);

const refreshToken = generateRefreshToken(
  user.userId,
  user.role
);

return {
  user: {
    userId: user.userId,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  },
  accessToken,
  refreshToken,
};

};
