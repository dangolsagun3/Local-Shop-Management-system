import { type Request, type Response, type NextFunction } from "express";

const ErrorHandlingMiddleware = (error: any, req: Request, res: Response, next: NextFunction) => {
    console.error("ShopX API Error:", error);
    let code = error.code || 500;
    let details = error.detail || error.details || null;
    let message = error.message || "Internal Server Error";

    if (error.code === 11000) {
        code = 409;
        const key = Object.keys(error.keyValue || {})[0] || "field";
        message = `A record with this ${key} already exists.`;
        details = error.keyValue || null;
    } else if (typeof code !== "number" || code < 100 || code > 599) {
        code = 500;
    }

    res.status(code).json({
        data: null,
        message: message,
        meta: details || null
    });
};

export default ErrorHandlingMiddleware;