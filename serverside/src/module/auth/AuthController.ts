import { type Request, type Response, type NextFunction } from "express";
import { mapImage } from "../../utilities/helpers";
import bcrypt from "bcryptjs";
import { randomString} from "../../utilities/helpers";
import UserModel from "../user/UserModel";
import EmailService from "../../services/EmailService";
import jwt  from "jsonwebtoken";
import { appConfig } from "../../config/AppConfig";
import AuthModel from "./AuthModel";
import { IAuthRequest } from "./AuthContract";

class AuthController{
    registerUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const body = { ...req.body };

            if (!body.name && body.fullName) {
                body.name = body.fullName;
            }
            if (!body.phone && body.contact) {
                body.phone = body.contact;
            }

            if (body.email) {
                body.email = body.email.trim().toLowerCase();
            }

            // Check if user with this email or phone/contact already exists
            const existingUser = await UserModel.findOne({
                $or: [
                    { email: body.email },
                    ...(body.phone ? [{ phone: body.phone }] : [])
                ]
            });

            if (existingUser) {
                const conflictField = existingUser.email === body.email ? "email" : "contact number";
                throw { code: 400, message: `User with this ${conflictField} already exists` };
            }

            if(req.file) {
                body.image = mapImage(req?.file as Express.Multer.File, "users/")
            }

            body.password = bcrypt.hashSync(body.password, 12);

            if (!body.role || !['customer', 'seller', 'cashier', 'manager', 'admin'].includes(body.role)) {
                body.role = 'customer';
            }

            // Verification step process - active by default for immediate shop access
            body.status = "active";
            body.emailVerify = true;
            body.activationToken = randomString();

            // db storage
            const user = new UserModel(body);
            await user.save();

            // Generate tokens for auto-login after signup
            const accessToken = jwt.sign({
                sub: user._id
            }, appConfig.jwtSecret as string, {
                expiresIn: "7d"
            });
            const refreshToken = jwt.sign({
                sub: user._id
            }, appConfig.jwtRefreshSecret as string, {
                expiresIn: "30d"
            });

            // Store session
            const session = new AuthModel({
                userId: user._id,
                accessToken: accessToken,
                refreshToken: refreshToken,
                status: "active",
                agent: "web"
            });
            await session.save();

            // user notify (graceful in case SMTP is not configured)
            try {
                const emailSvc = new EmailService();
                await emailSvc.sendEmail({
                    to: user.email,
                    sub: "Your account has been created - ShopX",   
                    message: `Dear ${user.name}, <br> 
                    Your account has been registered successfully in ShopX Local Shop Management. <br/>
                    Please login to continue the access. <br/>
                    Regards, <br/>
                    ShopX Admin <br/>
                    `
                });
            } catch (mailError) {
                console.log("Note: Email notification skipped or SMTP not configured:", (mailError as any)?.message || mailError);
            }

            res.status(201).json({
                success: true,
                token: accessToken,
                accessToken: accessToken,
                refreshToken: refreshToken,
                user: {
                    _id: user._id,
                    id: user._id,
                    name: user.name,
                    fullName: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    phone: user.phone,
                    contact: user.phone,
                    address: user.address,
                    image: user.image
                },
                data: {
                    token: accessToken,
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    user: {
                        _id: user._id,
                        id: user._id,
                        name: user.name,
                        fullName: user.name,
                        email: user.email,
                        role: user.role,
                        status: user.status,
                        phone: user.phone,
                        contact: user.phone,
                        address: user.address,
                        image: user.image
                    }
                },
                message: "Your account has been created successfully",
                meta: null
            });
        } catch (exception) {
            next(exception);
        }
    }
    loginUser = async (req: Request, res: Response, next: NextFunction) =>{
        try{
            const { username, email, contact, password } = req.body;
            const loginQuery = (username || email || contact || "").trim().toLowerCase();
            
            // Search user by email, name, or phone/contact
            const userDetail = await UserModel.findOne({
                $or: [
                    { email: loginQuery },
                    { name: loginQuery },
                    { phone: loginQuery }
                ]
            });
            if(!userDetail){
                throw {code: 422, message: "User does not exist"}
            }
            if (!bcrypt.compareSync(password, userDetail.password)){
                throw {code: 422, message: "Credentials do not match"}
            }

            const accessToken = jwt.sign({
                sub: userDetail._id
            }, appConfig.jwtSecret as string, {
                expiresIn: "7d"
            });
            const refreshToken = jwt.sign({
                sub: userDetail._id
            }, appConfig.jwtRefreshSecret as string, {
                expiresIn: "30d"
            });

            // session store in db
            let session = {
                userId: userDetail._id,
                accessToken: accessToken,
                refreshToken: refreshToken,
                status: "active",
                agent: "web"
            }
            const sessionDetail = new AuthModel(session)
            await sessionDetail.save()

            res.json({
                success: true,
                token: accessToken,
                accessToken: accessToken,
                refreshToken: refreshToken,
                user: {
                    _id: userDetail._id,
                    id: userDetail._id,
                    name: userDetail.name,
                    fullName: userDetail.name,
                    email: userDetail.email,
                    role: userDetail.role,
                    status: userDetail.status,
                    phone: userDetail.phone,
                    contact: userDetail.phone,
                    address: userDetail.address,
                    image: userDetail.image
                },
                data: {
                    token: accessToken,
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    user: {
                        _id: userDetail._id,
                        id: userDetail._id,
                        name: userDetail.name,
                        fullName: userDetail.name,
                        email: userDetail.email,
                        role: userDetail.role,
                        status: userDetail.status,
                        phone: userDetail.phone,
                        contact: userDetail.phone,
                        address: userDetail.address,
                        image: userDetail.image
                    }
                },
                message: "You are LoggedIn successfully",
                meta: null
            })

        } catch(exception){
            next(exception);
        }
        
    }
    ForgetPassword = (req: Request, res: Response) => {
        res.status(200).json({
            success: true,
            data: null,
            message: "Forget Password Request sent to Email",
            meta: null
        });
    }
    ChangePassword = (req: Request, res: Response) => {
        res.status(200).json({
            success: true,
            message: "Password Changed Successfully",
        });
    }
    UserProfile = (req: IAuthRequest, res: Response) => {
        res.status(200).json({
            success: true,
            data: req.loggedInUser || null,
            message: "User Profile",
            meta: null
        });
    }
    ResetPassword = (req: Request, res: Response) => {
        res.status(200).json({
            success: true,
            message: "Password Reset Successfully",
        });
    }
}

export default AuthController;