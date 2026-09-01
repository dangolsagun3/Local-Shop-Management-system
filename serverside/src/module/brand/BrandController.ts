import { type Response, type NextFunction } from "express";
import { IAuthRequest } from "../auth/AuthContract";
import slugify from "slugify";
import BrandModel from "./BrandModel";
import { mapImage } from "../../utilities/helpers";

class BrandController {
    async createBrand(req: IAuthRequest, res: Response, next: NextFunction) {
        try {
            const data = req.body;
            data.slug = slugify(data.name, { 
                // replacement: "-",
                remove: /[*+~.()'"!:@]/g,
                lower: true,
                strict: true,
                // locale: "en",
                // trim: true
            });
            // image
            if (req.file) {
                data.image = mapImage(req.file, "/brand");
            }
            // foreign key (parentId) null
            if(data.parentId || data.parentId === 'null') {
                data.parentId = null;
            }

            data.createdBy = req.loggedInUser?._id;
            data.updatedBy = req.loggedInUser?._id;
            const brand = new BrandModel(data)
            await brand.save();

            res.json({
                data: brand,
                message: "Brand created successfully",
                meta: null,
            })
        } catch(exception) {
            next(exception)
        }
    }

    async listAllBrand(req: IAuthRequest, res: Response, next: NextFunction) {
        try {
            // filter and pagination
            const page = Number(req.query.page || 1);
            const limit = Number(req.query.limit || 20);
            const skip = (page - 1) * limit;

            let filter: Record<string, unknown> = {}
            if(req.query.search) {
                filter = {
                    $or: [
                        {name: new RegExp(req.query.search as string, "i")},
                        {summary: new RegExp(req.query.serach as string, "i")},
                    ],
                };
            }

            if(req.query.status) {
                filter = {
                    ...filter,
                    status: (req.query.status as string).toLowerCase()
                }
            }

            const data = await BrandModel.find(filter)
            .populate("parentId", ["_id", "name", "slug", "image"])
            .populate("createdBy", ["_id", "name", "email", "role", "image"])
            .populate("updatedBy", ["_id", "name", "email", "role", "image"])
            .sort({ createdAt: "desc" })
            .skip(skip)
            .limit(limit);

            const count = await BrandModel.countDocuments();

            res.json({
                data: data,
                message: "All Brand listing",
                meta: {
                    pagination: {
                        page: page,
                        limit: limit,
                        total: count,
                        totalPages: Math.ceil(count / limit)
                    },
                },
            })
        } catch(exception) {
            next(exception)
        }
    }

    async getBrandDetail(req: IAuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await BrandModel.findOne({
                slug: req.params.slug as string
            }).populate("parentId", ["_id", "name", "slug", "image"])
            .populate("createdBy", ["_id", "name", "email", "role", "image"])
            .populate("updatedBy", ["_id", "name", "email", "role", "image"])

            if(!data) {
                throw {code: 422, message: "Brand does not exits"}
            }

            res.json({
                data: data,
                message: "Brand detail by slug",
                meat: null
            })

        } catch(exception) {
            next(exception)
        }
    }

    async updateBrand(req: IAuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await BrandModel.findOne({
                slug: req.params.slug as string,
            });

            if(!data) {
                throw {code: 422, message: "Brand does not exits"}
            }

            const payload = req.body;
            if(req.file) {
                payload.image =data.image;
            }

            //foreign key (parentId) null
            if(payload.parentId || payload.parentId === "null") {
                payload.parentId = null;
            }

            payload.updatedBy = req.loggedInUser?._id;

            const updatedData = await BrandModel.findOneAndUpdate({
                _id: data._id,
            }, payload, {new: true})

            res.json({
                data: updatedData,
                message: "Brand updated successfully",
                meta: null
            })
        } catch(exception) {
            next(exception)
        }
    }

    async deleteBrand(req: IAuthRequest, res: Response, next: NextFunction) {
        try {
            const del = await BrandModel.findOneAndDelete({
                slug: req.params.slug as string
            })

            if(!del) {
                throw {code: 422, message: "Brand does not exits or already deleted"}
            }

            res.json({
                data: del,
                message: "Brand deleted successfully",
                meta: null
            })

        } catch(exception) {
            next(exception)
        }
    }
}

export default BrandController;