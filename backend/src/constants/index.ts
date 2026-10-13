import dotenv from "dotenv";

dotenv.config();
export const nodeEnvironment = process.env.NODE_ENV!;

export const frontendUrl = process.env.FRONTEND_URL!;
