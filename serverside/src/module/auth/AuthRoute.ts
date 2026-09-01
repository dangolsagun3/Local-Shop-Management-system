import { Router } from "express";
import AuthController from "./AuthController";
import Auth from "../../middleware/AuthMiddleware";
import bodyValidator from "../../middleware/BodyValidationMiddleware";
import { LoginDTO, UserRegisterDTO } from "./AuthDto";
import uploader from "../../middleware/UploaderMiddleware";

const authRouter = Router();

const auth = new AuthController();

authRouter.post("/login", bodyValidator(LoginDTO), auth.loginUser);
authRouter.post("/register", uploader("users").single("image"), bodyValidator(UserRegisterDTO), auth.registerUser);
authRouter.post("/signup", uploader("users").single("image"), bodyValidator(UserRegisterDTO), auth.registerUser);
authRouter.get("/forgot-password", auth.ForgetPassword);
authRouter.post("/reset-password", auth.ResetPassword);
authRouter.post("/change-password", Auth(['admin']), auth.ChangePassword);
authRouter.get("/me", Auth(), auth.UserProfile);

export default authRouter;