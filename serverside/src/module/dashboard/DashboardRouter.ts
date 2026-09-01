import { Router } from "express";
import Auth from "../../middleware/AuthMiddleware";
import DashboardController from "./DashboardController";

const dashCtrl = new DashboardController();
const dashboardRouter = Router();

dashboardRouter.get("/stats", Auth(['admin', 'seller']), dashCtrl.getOverviewStats);
dashboardRouter.get("/chart", Auth(['admin', 'seller']), dashCtrl.getSalesChart);
dashboardRouter.get("/recent", Auth(['admin', 'seller']), dashCtrl.getRecentActivities);
dashboardRouter.get("/top-products", Auth(['admin', 'seller']), dashCtrl.getTopProducts);

export default dashboardRouter;
