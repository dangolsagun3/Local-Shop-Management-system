import { Router } from "express";
import Auth from "../../middleware/AuthMiddleware";
import DashboardController from "./DashboardController";

const dashCtrl = new DashboardController();
const dashboardRouter = Router();

dashboardRouter.get("/stats", Auth(['admin', 'seller', 'cashier', 'manager']), dashCtrl.getOverviewStats);
dashboardRouter.get("/chart", Auth(['admin', 'seller', 'cashier', 'manager']), dashCtrl.getSalesChart);
dashboardRouter.get("/recent", Auth(['admin', 'seller', 'cashier', 'manager']), dashCtrl.getRecentActivities);
dashboardRouter.get("/top-products", Auth(['admin', 'seller', 'cashier', 'manager']), dashCtrl.getTopProducts);

export default dashboardRouter;
