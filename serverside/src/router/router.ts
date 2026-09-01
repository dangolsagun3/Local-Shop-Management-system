import { Router, type Request, type Response } from "express";
import authRouter from "../module/auth/AuthRoute";
import userRouter from "../module/user/UserRouter";
import categoryRouter from "../module/category/CategoryRouter";
import brandRouter from "../module/brand/BrandRouter";
import productRouter from "../module/product/ProductRouter";
import saleRouter from "../module/sale/SaleRouter";
import dashboardRouter from "../module/dashboard/DashboardRouter";
import { seedDatabaseIfEmpty } from "../services/SeedService";

const router = Router();

router.get("/", (request: Request, response: Response) => {
    response.json({
        data: {
            name: "ShopX API",
            version: "1.0.0",
            status: "online"
        },
        message: "ShopX Local Shop Management API is running",
        meta: null
    });
});

router.post("/seed", async (req: Request, res: Response) => {
    try {
        await seedDatabaseIfEmpty();
        res.json({
            data: true,
            message: "Store data seeded / verified successfully",
            meta: null
        });
    } catch (err: any) {
        res.status(500).json({
            data: null,
            message: err?.message || "Seeding failed",
            meta: null
        });
    }
});

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/category", categoryRouter);
router.use("/brand", brandRouter);
router.use("/product", productRouter);
router.use("/sale", saleRouter);
router.use("/dashboard", dashboardRouter);

export default router;
