import {  type Response, type NextFunction } from "express";
import AuthModel from "../module/auth/AuthModel";
import { appConfig } from "../config/AppConfig";
import jwt from "jsonwebtoken";
import UserModel from "../module/user/UserModel";
import { IAuthRequest } from "../module/auth/AuthContract";

const Auth = (allowedRoles: Array<string> | null = null) => {
    return async (req: IAuthRequest, res: Response, next: NextFunction) => {
        try {
            let token = req.headers['authorization']
            if(!token) {
                throw {code: 401, message: "Unauthorized"}
            }
            token = token.replace("Bearer ", "").trim();

            // verify fron db
            const session = await AuthModel.findOne ({
                accessToken: token, status: 'active'
            })
            if(!session) {
                throw {code: 401, message: "Token not found or session expired.", detail: {TOKEN_EXPIRED: 1}}
            }

            //token verify
            const data = jwt.verify(token, appConfig.jwtSecret as string)

            const userDetail = await UserModel.findById(data.sub, {password: 0});
            if(!userDetail) {
                throw {code: 422, message: "User not found or already deleted"}
            }

            req.loggedInUser = {
                _id: `${userDetail._id}`,
                name: userDetail.name,
                email: userDetail.email,
                role: userDetail.role,
                emailVerified: userDetail.emailVerify,
                image: (userDetail.image as any) || null,
                address: userDetail.address,
                status: userDetail.status
            }

            if(!
                allowedRoles || 
                userDetail.role === "admin" || 
                allowedRoles.includes(userDetail.role))
                {
                next()
            } else {
                throw {code: 403, message: "permission Denied"}
            }

        } catch (exception) {
            if(exception instanceof jwt.TokenExpiredError) {
                next({code: 401, message: "TOKEN_EXPIRED"})
            } else if(exception instanceof jwt.JsonWebTokenError) {
                next({code: 401, message: exception.message})
            } else {
                next (exception)
            }
        }
    };
}

export default Auth;