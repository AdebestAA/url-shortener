import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import urlRoutes from "./routes/url-routes";
import { nodeEnvironment } from "./constants";

dotenv.config();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin:
      nodeEnvironment === "production"
        ? process.env.FRONTEND_URL
        : "http://localhost:5181",
    credentials: true,
  }),
);

app.get("/", (_req, res) => {
  res.json({ message: "Backend is running" });
});

app.get("/health", (_req, res) => {
  res.json({ message: "api is healthy", success: true });
});

app.use("/api/urls", urlRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`);
});
