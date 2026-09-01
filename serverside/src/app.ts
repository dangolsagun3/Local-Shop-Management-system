import path from "path";
import express, { type Request, type Response, type NextFunction } from "express";
import router from "./router/router";
import ErrorHandlingMiddleware from "./middleware/ErrorHandlingMiddleware";
import cors from "cors";
import "./config/mongodbConfig";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

import authRouter from "./module/auth/AuthRoute";

const app = express();

// CORS configuration
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Helmet security headers (configured for static image loading)
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting (generous for local shop / POS operations)
const limit = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 1000,
    message: { data: null, message: "Too many requests, please try again later.", meta: null }
});
app.use(limit);

app.use(express.json({
    limit: "10mb"
}));

app.use(express.urlencoded({
    limit: "10mb",
    extended: true
}));

app.use("/image", express.static(path.resolve("./public/uploads")));

// Load all API routes
app.use("/api/v1", router);
app.use("/api/auth", authRouter);
app.use("/api", router);

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
    next({ code: 404, message: `Route ${req.method} ${req.originalUrl} not found` });
});

// Error handling middleware
app.use(ErrorHandlingMiddleware);

export default app;
