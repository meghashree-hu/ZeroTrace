import dotenv from "dotenv";

dotenv.config();

export const env = {
    PORT: process.env.PORT || "5000",

    NODE_ENV: process.env.NODE_ENV || "development",

    JWT_SECRET: process.env.JWT_SECRET || "",

    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "",

    MONGODB_URI: process.env.MONGODB_URI || "",

    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",

    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",

    AWS_REGION: process.env.AWS_REGION || "",

    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME || "",

    APP_URL: process.env.APP_URL || ""
};
