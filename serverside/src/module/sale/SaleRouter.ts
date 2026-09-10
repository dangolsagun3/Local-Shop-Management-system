import { Router } from "express";
import Auth from "../../middleware/AuthMiddleware";
import SaleController from "./SaleController";

const saleCtrl = new SaleController();
const saleRouter = Router();

// Only customer can buy from POS terminal; admin, seller, cashier, and manager cannot buy products
saleRouter.post("/", Auth(['customer']), saleCtrl.createSale);
saleRouter.get("/", Auth(['admin', 'seller', 'cashier', 'manager', 'customer']), saleCtrl.listAllSales);
saleRouter.get("/:idOrInvoice", Auth(['admin', 'seller', 'cashier', 'manager', 'customer']), saleCtrl.getSaleDetail);
saleRouter.post("/:id/cancel", Auth(['admin', 'seller', 'manager']), saleCtrl.cancelSale);

export default saleRouter;
