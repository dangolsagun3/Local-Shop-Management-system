import { Router } from "express";
import Auth from "../../middleware/AuthMiddleware";
import CategoryController from "./CategoryController";
import bodyValidator from "../../middleware/BodyValidationMiddleware";
import { CategoryCreateDTO } from "./CatrgoryDto";
import uploader from "../../middleware/UploaderMiddleware";

const catCtrl = new CategoryController();
const categoryRouter = Router();

categoryRouter.get("/", catCtrl.listAllCategory);
categoryRouter.get("/:slug", catCtrl.getCategoryDetail);
categoryRouter.post("/", Auth(['admin', 'seller']), uploader('/category').single('image'), bodyValidator(CategoryCreateDTO), catCtrl.createCategory);
categoryRouter.put("/:slug", Auth(['admin', 'seller']), bodyValidator(CategoryCreateDTO), catCtrl.updateCategory);
categoryRouter.delete("/:slug", Auth(['admin']), catCtrl.deleteCategory);

export default categoryRouter;
