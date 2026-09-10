import { type Response, type NextFunction } from "express";
import { IAuthRequest } from "../auth/AuthContract";
import SaleModel from "./SaleModel";
import ProductModel from "../product/ProductModel";
import mongoose from "mongoose";

class SaleController {
    createSale = async (req: IAuthRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.loggedInUser) {
                throw { code: 401, message: "Authentication required: Please sign in as a customer to purchase products from the POS terminal." };
            }

            // Strictly enforce: Only customer can buy from POS terminal. Admin, cashier, manager cannot buy.
            if (req.loggedInUser.role !== "customer") {
                throw {
                    code: 403,
                    message: `Buying restricted: Users with role '${req.loggedInUser.role}' (Admin, Cashier, Manager) are not allowed to purchase products in the POS terminal. Only customers can buy.`
                };
            }

            const {
                customer,
                items,
                subtotal,
                discount,
                tax,
                totalAmount,
                paidAmount,
                paymentMethod,
                notes
            } = req.body;

            if (!items || !Array.isArray(items) || items.length === 0) {
                throw { code: 400, message: "Sale must contain at least one item" };
            }

            // Generate unique invoice number
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
            const randomCode = Math.floor(Math.random() * 9000 + 1000);
            const invoiceNumber = `INV-${dateStr}-${randomCode}`;

            const processedItems = [];
            for (const item of items) {
                const product = await ProductModel.findById(item.productId || item.product || item._id);
                if (!product) {
                    throw { code: 404, message: `Product not found: ${item.name || item.productId}` };
                }

                const qty = Number(item.quantity || 1);
                if (product.stock < qty) {
                    throw {
                        code: 400,
                        message: `Insufficient stock for '${product.name}'. Available: ${product.stock}, Requested: ${qty}`
                    };
                }

                // Decrement inventory
                product.stock = Math.max(0, product.stock - qty);
                if (product.stock === 0) {
                    product.status = "out_of_stock";
                }
                await product.save();

                processedItems.push({
                    product: product._id,
                    name: product.name,
                    sku: product.sku || "",
                    price: Number(item.price || product.price),
                    costPrice: Number(product.costPrice || 0),
                    quantity: qty,
                    discount: Number(item.discount || 0),
                    unit: product.unit || "pcs",
                    total: Number(item.total || (Number(item.price || product.price) * qty))
                });
            }

            const calcSubtotal = Number(subtotal || processedItems.reduce((acc, i) => acc + i.total, 0));
            const calcDiscount = Number(discount || 0);
            const calcTax = Number(tax || 0);
            const calcTotal = Number(totalAmount || (calcSubtotal - calcDiscount + calcTax));
            const calcPaid = Number(paidAmount !== undefined ? paidAmount : calcTotal);
            const changeAmount = Math.max(0, calcPaid - calcTotal);
            const dueAmount = Math.max(0, calcTotal - calcPaid);

            let paymentStatus = "paid";
            if (dueAmount > 0) {
                paymentStatus = calcPaid > 0 ? "partial" : "due";
            }

            const sale = new SaleModel({
                invoiceNumber,
                customer: {
                    name: customer?.name || req.loggedInUser?.name || "Customer",
                    phone: customer?.phone || req.loggedInUser?.phone || "",
                    email: customer?.email || req.loggedInUser?.email || "",
                    address: customer?.address || req.loggedInUser?.address || ""
                },
                items: processedItems,
                subtotal: calcSubtotal,
                discount: calcDiscount,
                tax: calcTax,
                totalAmount: calcTotal,
                paidAmount: calcPaid,
                changeAmount,
                dueAmount,
                paymentMethod: paymentMethod || "cash",
                paymentStatus,
                orderStatus: "completed",
                notes: notes || "",
                cashier: req.loggedInUser?._id ? new mongoose.Types.ObjectId(req.loggedInUser._id) : null,
                cashierName: req.loggedInUser?.name || "Customer"
            });

            await sale.save();

            res.status(201).json({
                data: sale,
                message: "Sale completed successfully",
                meta: null
            });
        } catch (exception) {
            next(exception);
        }
    };

    listAllSales = async (req: IAuthRequest, res: Response, next: NextFunction) => {
        try {
            const page = Math.max(1, Number(req.query.page || 1));
            const limit = Math.max(1, Math.min(100, Number(req.query.limit || 20)));
            const skip = (page - 1) * limit;

            let filter: Record<string, any> = {};

            if (req.query.search) {
                const searchRegex = new RegExp(String(req.query.search).trim(), "i");
                filter.$or = [
                    { invoiceNumber: searchRegex },
                    { "customer.name": searchRegex },
                    { "customer.phone": searchRegex }
                ];
            }

            if (req.query.paymentMethod && req.query.paymentMethod !== "all") {
                filter.paymentMethod = req.query.paymentMethod;
            }

            if (req.query.paymentStatus && req.query.paymentStatus !== "all") {
                filter.paymentStatus = req.query.paymentStatus;
            }

            if (req.query.orderStatus && req.query.orderStatus !== "all") {
                filter.orderStatus = req.query.orderStatus;
            }

            if (req.query.startDate && req.query.endDate) {
                filter.createdAt = {
                    $gte: new Date(String(req.query.startDate)),
                    $lte: new Date(String(req.query.endDate) + "T23:59:59.999Z")
                };
            } else if (req.query.today === "true") {
                const startOfDay = new Date();
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date();
                endOfDay.setHours(23, 59, 59, 999);
                filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
            }

            const sales = await SaleModel.find(filter)
                .populate("cashier", ["_id", "name", "email"])
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await SaleModel.countDocuments(filter);

            res.json({
                data: sales,
                message: "Sales retrieved successfully",
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

    getSaleDetail = async (req: IAuthRequest, res: Response, next: NextFunction) => {
        try {
            const idOrInv = String(req.params.idOrInvoice || "");
            let query: Record<string, any> = {};

            if (mongoose.Types.ObjectId.isValid(idOrInv)) {
                query = { _id: new mongoose.Types.ObjectId(idOrInv) };
            } else {
                query = { invoiceNumber: idOrInv };
            }

            const sale = await SaleModel.findOne(query)
                .populate("items.product", ["_id", "name", "sku", "image", "imageUrl", "unit"])
                .populate("cashier", ["_id", "name", "email"]);

            if (!sale) {
                throw { code: 404, message: "Sale invoice not found" };
            }

            res.json({
                data: sale,
                message: "Sale invoice retrieved",
                meta: null
            });
        } catch (exception) {
            next(exception);
        }
    };

    cancelSale = async (req: IAuthRequest, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            const sale = await SaleModel.findById(id);

            if (!sale) {
                throw { code: 404, message: "Sale not found" };
            }

            if (sale.orderStatus === "cancelled" || sale.orderStatus === "refunded") {
                throw { code: 400, message: "Sale is already cancelled or refunded" };
            }

            // Restore product stock
            for (const item of sale.items) {
                if (item.product) {
                    const product = await ProductModel.findById(item.product);
                    if (product) {
                        product.stock += item.quantity;
                        if (product.status === "out_of_stock" && product.stock > 0) {
                            product.status = "active";
                        }
                        await product.save();
                    }
                }
            }

            sale.orderStatus = "cancelled";
            await sale.save();

            res.json({
                data: sale,
                message: "Sale cancelled and stock restored successfully",
                meta: null
            });
        } catch (exception) {
            next(exception);
        }
    };
}

export default SaleController;
