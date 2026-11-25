
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
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is missing.");
}

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error(
    "JWT_SECRET must be at least 32 characters long."
  );
}

app.use(
  cors({
    origin: CLIENT_URL.split(",").map(value => value.trim()),
    credentials: false
  })
);

app.use(express.json({ limit: "1mb" }));

// Reuse the MongoDB connection across requests
let connectionPromise = null;

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(MONGODB_URI)
      .then(() => {
        console.log("Connected to MongoDB Atlas.");
        connectionPromise = null;
      })
      .catch(error => {
        connectionPromise = null;
        throw error;
      });
  }

  await connectionPromise;
}

// Ensure the database is connected before processing API requests
app.use(async (_req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);

    res.status(503).json({
      message: "Database connection unavailable. Please try again."
    });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected"
  });
});

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

// Export Express app for Vercel
export default app;

// Start a regular server during local development
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`SpendWise API running at http://localhost:${PORT}`);
  });
}
