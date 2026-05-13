import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

/* =========================================
   SECURITY MIDDLEWARE
========================================= */

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many requests from this IP",
});

app.use(limiter);

/* =========================================
   CORS
========================================= */

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

/* =========================================
   BODY PARSER
========================================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* =========================================
   LOGGER
========================================= */

app.use(morgan("dev"));

/* =========================================
   ROUTES
========================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "STRAK API Running Successfully",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

/* =========================================
   404 HANDLER
========================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* =========================================
   GLOBAL ERROR HANDLER
========================================= */

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

export default app;