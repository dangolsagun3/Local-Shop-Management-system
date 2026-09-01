import { Router } from "express";
import Auth from "../../middleware/AuthMiddleware";
import BrandController from "./BrandController";
import bodyValidator from "../../middleware/BodyValidationMiddleware";
import { BrandCreateDTO } from "./BrandDto";
import uploader from "../../middleware/UploaderMiddleware";

const brandCtrl = new BrandController();
const brandRouter = Router();

brandRouter.get("/", brandCtrl.listAllBrand);
brandRouter.get("/:slug", brandCtrl.getBrandDetail);
brandRouter.post("/", Auth(['admin', 'seller']), uploader('/brand').single('image'), bodyValidator(BrandCreateDTO), brandCtrl.createBrand);
brandRouter.put("/:slug", Auth(['admin', 'seller']), bodyValidator(BrandCreateDTO), brandCtrl.updateBrand);
brandRouter.delete("/:slug", Auth(['admin']), brandCtrl.deleteBrand);

export default brandRouter;
