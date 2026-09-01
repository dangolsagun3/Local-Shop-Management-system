import { Router } from "express";
import Auth from "../../middleware/AuthMiddleware";
import SaleController from "./SaleController";

const saleCtrl = new SaleController();
const saleRouter = Router();

saleRouter.post("/", Auth(['admin', 'seller', 'customer']), saleCtrl.createSale);
saleRouter.get("/", Auth(['admin', 'seller']), saleCtrl.listAllSales);
saleRouter.get("/:idOrInvoice", Auth(['admin', 'seller', 'customer']), saleCtrl.getSaleDetail);
saleRouter.post("/:id/cancel", Auth(['admin', 'seller']), saleCtrl.cancelSale);

export default saleRouter;
