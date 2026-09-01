import { Router } from "express";
import UserController from "./UserController";
import Auth from "../../middleware/AuthMiddleware";

const userRouter = Router();
const userController = new UserController();

userRouter.get("/", Auth(['admin', 'seller']), userController.listAll);
userRouter.get("/:id", Auth(['admin', 'seller']), userController.getUserById);
userRouter.put("/:id", Auth(['admin']), userController.updateUser);
userRouter.delete("/:id", Auth(['admin']), userController.deleteUser);

export default userRouter;
