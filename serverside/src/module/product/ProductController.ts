import { type Response, type NextFunction } from "express";
import { IAuthRequest } from "../auth/AuthContract";
import slugify from "slugify";
import ProductModel from "./ProductModel";
import { mapImage } from "../../utilities/helpers";
import mongoose from "mongoose";

class ProductController {
    createProduct = async (req: IAuthRequest, res: Response, next: NextFunction) => {
        try {
            const data = { ...req.body };

            // Generate unique slug
            const baseSlug = slugify(data.name || "product", {
                remove: /[*+~.()'"!:@]/g,
                lower: true,
                strict: true
            });
            let uniqueSlug = baseSlug;
            let counter = 1;
            while (await ProductModel.findOne({ slug: uniqueSlug })) {
                uniqueSlug = `${baseSlug}-${counter++}`;
            }
            data.slug = uniqueSlug;

            // Generate SKU if missing
            if (!data.sku || data.sku.trim() === "") {
                data.sku = `SKU-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
            }

            // Image file upload
            if (req.file) {
                data.image = mapImage(req.file, "/products");
                data.imageUrl = data.image.url;
            }

            // Foreign keys formatting
            if (!data.category || data.category === "null" || data.category === "") {
                data.category = null;
            }
            // Auto-calculate status
            if (Number(data.stock) <= 0) {
                data.status = "out_of_stock";
            } else if (!data.status) {
                data.status = "active";
            }

            data.createdBy = req.loggedInUser?._id ? new mongoose.Types.ObjectId(req.loggedInUser._id) : null;
            data.updatedBy = req.loggedInUser?._id ? new mongoose.Types.ObjectId(req.loggedInUser._id) : null;

            const product = new ProductModel(data);
            await product.save();

            const populatedProduct = await ProductModel.findById(product._id)
                .populate("category", ["_id", "name", "slug"]);

            res.status(201).json({
                data: populatedProduct,
                message: "Product created successfully",
                meta: null
            });
        } catch (exception) {
            next(exception);
        }
    };

    listAllProduct = async (req: IAuthRequest, res: Response, next: NextFunction) => {
        try {
            const page = Math.max(1, Number(req.query.page || 1));
            const limit = Math.max(1, Math.min(100, Number(req.query.limit || 20)));
            const skip = (page - 1) * limit;

            let filter: Record<string, any> = {};

            // Search filter (name, sku, barcode, description)
            if (req.query.search) {
                const searchStr = String(req.query.search).trim();
                const searchRegex = new RegExp(searchStr, "i");
                filter.$or = [
                    { name: searchRegex },
                    { sku: searchRegex },
                    { barcode: searchRegex },
                    { description: searchRegex }
                ];
            }

            // Category filter
            if (req.query.category && req.query.category !== "all") {
                if (mongoose.Types.ObjectId.isValid(String(req.query.category))) {
                    filter.category = new mongoose.Types.ObjectId(String(req.query.category));
                }
            }

            // Status filter
            if (req.query.status && req.query.status !== "all") {
                filter.status = req.query.status;
            }

            // Low stock filter
            if (req.query.low_stock === "true") {
                filter.$expr = { $lte: ["$stock", "$lowStockThreshold"] };
            }

            // Sorting
            let sort: Record<string, any> = { createdAt: -1 };
            if (req.query.sortBy) {
                const sortField = String(req.query.sortBy);
                const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
                sort = { [sortField]: sortOrder };
            }

            const products = await ProductModel.find(filter)
                .populate("category", ["_id", "name", "slug"])
                .sort(sort)
                .skip(skip)
                .limit(limit);

            const total = await ProductModel.countDocuments(filter);

            res.json({
                data: products,
                message: "Products retrieved successfully",
                meta: {
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (exception) {
            next(exception);
        }
    };

    getProductDetail = async (req: IAuthRequest, res: Response, next: NextFunction) => {
        try {
            const idOrSlug = String(req.params.idOrSlug || "");
            let query: Record<string, any> = {};

            if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
                query = { _id: new mongoose.Types.ObjectId(idOrSlug) };
            } else {
                query = { slug: idOrSlug };
            }

            const product = await ProductModel.findOne(query)
                .populate("category", ["_id", "name", "slug"])
                .populate("createdBy", ["_id", "name", "email"])
                .populate("updatedBy", ["_id", "name", "email"]);

            if (!product) {
                throw { code: 404, message: "Product not found" };
            }

            res.json({
                data: product,
                message: "Product detail retrieved",
                meta: null
            });
        } catch (exception) {
            next(exception);
        }
    };

    updateProduct = async (req: IAuthRequest, res: Response, next: NextFunction) => {
        try {
            const idOrSlug = String(req.params.idOrSlug || "");
            let query: Record<string, any> = {};

            if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
                query = { _id: new mongoose.Types.ObjectId(idOrSlug) };
            } else {
                query = { slug: idOrSlug };
            }

            const existingProduct = await ProductModel.findOne(query);
            if (!existingProduct) {
                throw { code: 404, message: "Product not found" };
            }

            const payload = { ...req.body };
            delete payload._id;

            if (req.file) {
                payload.image = mapImage(req.file, "/products");
                payload.imageUrl = payload.image.url;
            }

            // Foreign keys formatting
            if (payload.category === "null" || payload.category === "") {
                payload.category = null;
            }
            if (payload.stock !== undefined) {
                if (Number(payload.stock) <= 0) {
                    payload.status = "out_of_stock";
                } else if (existingProduct.status === "out_of_stock" && Number(payload.stock) > 0) {
                    payload.status = "active";
                }
            }

            payload.updatedBy = req.loggedInUser?._id ? new mongoose.Types.ObjectId(req.loggedInUser._id) : null;

            const updatedProduct = await ProductModel.findOneAndUpdate(
                { _id: existingProduct._id },
                payload,
                { new: true }
            )
                .populate("category", ["_id", "name", "slug"]);

            res.json({
                data: updatedProduct,
                message: "Product updated successfully",
                meta: null
            });
        } catch (exception) {
            next(exception);
        }
    };

    deleteProduct = async (req: IAuthRequest, res: Response, next: NextFunction) => {
        try {
            const idOrSlug = String(req.params.idOrSlug || "");
            let query: Record<string, any> = {};

            if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
                query = { _id: new mongoose.Types.ObjectId(idOrSlug) };
            } else {
                query = { slug: idOrSlug };
            }

            const deleted = await ProductModel.findOneAndDelete(query);
            if (!deleted) {
                throw { code: 404, message: "Product not found or already deleted" };
            }

            res.json({
                data: deleted,
                message: "Product deleted successfully",
                meta: null
            });
        } catch (exception) {
            next(exception);
        }
    };

    getLowStockProducts = async (req: IAuthRequest, res: Response, next: NextFunction) => {
        try {
            const lowStockProducts = await ProductModel.find({
                $expr: { $lte: ["$stock", "$lowStockThreshold"] }
            })
                .populate("category", ["_id", "name"])
                .sort({ stock: 1 })
                .limit(20);

            res.json({
                data: lowStockProducts,
                message: "Low stock products retrieved",
                meta: { count: lowStockProducts.length }
            });
        } catch (exception) {
            next(exception);
        }
    };

    adjustStock = async (req: IAuthRequest, res: Response, next: NextFunction) => {
        try {
            const { productId, changeAmount, reason } = req.body;
            if (!productId || changeAmount === undefined) {
                throw { code: 400, message: "productId and changeAmount are required" };
            }

            const product = await ProductModel.findById(productId);
            if (!product) {
                throw { code: 404, message: "Product not found" };
            }

            const newStock = Math.max(0, product.stock + Number(changeAmount));
            product.stock = newStock;
            if (newStock === 0) {
                product.status = "out_of_stock";
            } else if (product.status === "out_of_stock" && newStock > 0) {
                product.status = "active";
            }

            await product.save();

            res.json({
                data: product,
                message: `Stock updated to ${newStock} (${reason || "Manual Adjustment"})`,
                meta: null
            });
        } catch (exception) {
            next(exception);
        }
    };
}

export default ProductController;
