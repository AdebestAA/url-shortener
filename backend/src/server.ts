import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Backend is running" });
});

app.get("/health", (_req, res) => {
  res.json({ message: "api is healthy", success: true });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`);
});
