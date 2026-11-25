
import dns from "node:dns";
import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import recordRoutes from "./routes/records.js";

// Configure DNS for MongoDB Atlas SRV lookup
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

if (!process.env.MONGODB_URI) {
  console.error(
    "MONGODB_URI is missing. Copy server/.env.example to server/.env and add your Atlas URI."
  );
  process.exit(1);
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error(
    "JWT_SECRET must be set to a random string at least 32 characters long."
  );
  process.exit(1);
}

app.use(
  cors({
    origin: CLIENT_URL.split(",").map(value => value.trim()),
    credentials: false
  })
);

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) =>
  res.json({
    status: "ok",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  })
);

app.use("/api/auth", authRoutes);
app.use("/api", recordRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);

  if (err.code === 11000) {
    return res.status(409).json({
      message: "An account with this email already exists."
    });
  }

  res.status(500).json({
    message: "Something went wrong on the server."
  });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB Atlas.");

    app.listen(PORT, () => {
      console.log(`SpendWise API running at http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
