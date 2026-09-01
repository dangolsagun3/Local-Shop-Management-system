import { Router } from "express";
import Auth from "../../middleware/AuthMiddleware";
import ProductController from "./ProductController";
import bodyValidator from "../../middleware/BodyValidationMiddleware";
import { ProductCreateDTO, ProductUpdateDTO } from "./ProductDto";
import uploader from "../../middleware/UploaderMiddleware";

const productCtrl = new ProductController();
const productRouter = Router();

productRouter.get("/low-stock", productCtrl.getLowStockProducts);
productRouter.post("/adjust-stock", Auth(['admin', 'seller']), productCtrl.adjustStock);
productRouter.get("/", productCtrl.listAllProduct);
productRouter.get("/:idOrSlug", productCtrl.getProductDetail);
productRouter.post("/", Auth(['admin', 'seller']), uploader('/products').single('image'), bodyValidator(ProductCreateDTO), productCtrl.createProduct);
productRouter.put("/:idOrSlug", Auth(['admin', 'seller']), uploader('/products').single('image'), bodyValidator(ProductUpdateDTO), productCtrl.updateProduct);
productRouter.delete("/:idOrSlug", Auth(['admin', 'seller']), productCtrl.deleteProduct);

export default productRouter;
