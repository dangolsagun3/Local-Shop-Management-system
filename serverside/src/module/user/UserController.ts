import { type Response, type NextFunction } from "express";
import { IAuthRequest } from "../auth/AuthContract";
import UserModel from "./UserModel";
import bcrypt from "bcryptjs";

class UserController {
    listAll = async (req: IAuthRequest, res: Response, next: NextFunction) => {
        try {
            const page = Number(req.query.page || 1);
            const limit = Number(req.query.limit || 50);
            const skip = (page - 1) * limit;

            let filter: Record<string, unknown> = {};
            if (req.query.role) {
                filter.role = req.query.role;
            }
            if (req.query.status) {
                filter.status = req.query.status;
            }
            if (req.query.search) {
                const searchRegex = new RegExp(req.query.search as string, "i");
                filter.$or = [
                    { name: searchRegex },
                    { email: searchRegex },
                    { phone: searchRegex }
                ];
            }

            const users = await UserModel.find(filter, { password: 0 })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const count = await UserModel.countDocuments(filter);

            res.json({
                data: users,
                message: "Users retrieved successfully",
                meta: {
                    pagination: {
                        page,
                        limit,
                        total: count,
                        totalPages: Math.ceil(count / limit)
                    }
                }
            });
        } catch (exception) {
            next(exception);
        }
    };

    getUserById = async (req: IAuthRequest, res: Response, next: NextFunction) => {
        try {
            const user = await UserModel.findById(req.params.id, { password: 0 });
            if (!user) {
                throw { code: 404, message: "User not found" };
            }
            res.json({
                data: user,
                message: "User detail retrieved",
                meta: null
            });
        } catch (exception) {
            next(exception);
        }
    };

    updateUser = async (req: IAuthRequest, res: Response, next: NextFunction) => {
        try {
            const payload: any = { ...req.body };
            delete payload._id;

            if (payload.password) {
                payload.password = bcrypt.hashSync(payload.password, 12);
            } else {
                delete payload.password;
            }

            const updatedUser = await UserModel.findByIdAndUpdate(
                req.params.id,
                payload,
                { new: true, select: "-password" }
            );

            if (!updatedUser) {
                throw { code: 404, message: "User not found" };
            }

            res.json({
                data: updatedUser,
                message: "User updated successfully",
                meta: null
            });
        } catch (exception) {
            next(exception);
        }
    };

    deleteUser = async (req: IAuthRequest, res: Response, next: NextFunction) => {
        try {
            const deletedUser = await UserModel.findByIdAndDelete(req.params.id);
            if (!deletedUser) {
                throw { code: 404, message: "User not found or already deleted" };
            }
            res.json({
                data: deletedUser,
                message: "User deleted successfully",
                meta: null
            });
        } catch (exception) {
            next(exception);
        }
    };
}

export default UserController;
