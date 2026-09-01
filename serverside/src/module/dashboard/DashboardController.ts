import { type Response, type NextFunction } from "express";
import { IAuthRequest } from "../auth/AuthContract";
import SaleModel from "../sale/SaleModel";
import ProductModel from "../product/ProductModel";
import UserModel from "../user/UserModel";

class DashboardController {
    getOverviewStats = async (req: IAuthRequest, res: Response, next: NextFunction) => {
        try {
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);

            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            // Total revenue and sales count
            const allSalesStats = await SaleModel.aggregate([
                { $match: { orderStatus: "completed" } },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$totalAmount" },
                        totalOrders: { $sum: 1 },
                        totalDiscount: { $sum: "$discount" }
                    }
                }
            ]);

            // Today's sales
            const todaySalesStats = await SaleModel.aggregate([
                {
                    $match: {
                        orderStatus: "completed",
                        createdAt: { $gte: startOfToday }
                    }
                },
                {
                    $group: {
                        _id: null,
                        todayRevenue: { $sum: "$totalAmount" },
                        todayOrders: { $sum: 1 }
                    }
                }
            ]);

            // This month's sales
            const monthSalesStats = await SaleModel.aggregate([
                {
                    $match: {
                        orderStatus: "completed",
                        createdAt: { $gte: startOfMonth }
                    }
                },
                {
                    $group: {
                        _id: null,
                        monthRevenue: { $sum: "$totalAmount" },
                        monthOrders: { $sum: 1 }
                    }
                }
            ]);

            // Products stats
            const totalProducts = await ProductModel.countDocuments();
            const lowStockCount = await ProductModel.countDocuments({
                $expr: { $lte: ["$stock", "$lowStockThreshold"] },
                stock: { $gt: 0 }
            });
            const outOfStockCount = await ProductModel.countDocuments({ stock: { $lte: 0 } });

            // Inventory Valuation
            const inventoryValuation = await ProductModel.aggregate([
                {
                    $group: {
                        _id: null,
                        totalCostValue: { $sum: { $multiply: ["$costPrice", "$stock"] } },
                        totalRetailValue: { $sum: { $multiply: ["$price", "$stock"] } },
                        totalStockUnits: { $sum: "$stock" }
                    }
                }
            ]);

            // Customers count
            const totalUsers = await UserModel.countDocuments();
            const totalCustomers = await UserModel.countDocuments({ role: "customer" });

            res.json({
                data: {
                    revenue: {
                        total: allSalesStats[0]?.totalRevenue || 0,
                        today: todaySalesStats[0]?.todayRevenue || 0,
                        thisMonth: monthSalesStats[0]?.monthRevenue || 0,
                        totalDiscount: allSalesStats[0]?.totalDiscount || 0
                    },
                    orders: {
                        total: allSalesStats[0]?.totalOrders || 0,
                        today: todaySalesStats[0]?.todayOrders || 0,
                        thisMonth: monthSalesStats[0]?.monthOrders || 0
                    },
                    inventory: {
                        totalProducts,
                        lowStockCount,
                        outOfStockCount,
                        totalStockUnits: inventoryValuation[0]?.totalStockUnits || 0,
                        costValuation: inventoryValuation[0]?.totalCostValue || 0,
                        retailValuation: inventoryValuation[0]?.totalRetailValue || 0,
                        estimatedProfit: (inventoryValuation[0]?.totalRetailValue || 0) - (inventoryValuation[0]?.totalCostValue || 0)
                    },
                    users: {
                        total: totalUsers,
                        customers: totalCustomers
                    }
                },
                message: "Dashboard stats retrieved successfully",
                meta: null
            });
        } catch (exception) {
            next(exception);
        }
    };

    getSalesChart = async (req: IAuthRequest, res: Response, next: NextFunction) => {
        try {
            const days = Number(req.query.days || 7);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - (days - 1));
            startDate.setHours(0, 0, 0, 0);

            const dailyStats = await SaleModel.aggregate([
                {
                    $match: {
                        orderStatus: "completed",
                        createdAt: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                        },
                        revenue: { $sum: "$totalAmount" },
                        orders: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            // Fill missing days with zero
            const dateMap = new Map(dailyStats.map(d => [d._id, d]));
            const chartData = [];
            for (let i = days - 1; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateKey = d.toISOString().slice(0, 10);
                const dayLabel = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                
                const existing = dateMap.get(dateKey);
                chartData.push({
                    date: dateKey,
                    label: dayLabel,
                    revenue: existing?.revenue || 0,
                    orders: existing?.orders || 0
                });
            }

            res.json({
                data: chartData,
                message: "Sales chart data retrieved",
                meta: null
            });
        } catch (exception) {
            next(exception);
        }
    };

    getRecentActivities = async (req: IAuthRequest, res: Response, next: NextFunction) => {
        try {
            const recentSales = await SaleModel.find()
                .sort({ createdAt: -1 })
                .limit(8)
                .populate("cashier", ["name", "email"]);

            res.json({
                data: recentSales,
                message: "Recent sales activities retrieved",
                meta: null
            });
        } catch (exception) {
            next(exception);
        }
    };

    getTopProducts = async (req: IAuthRequest, res: Response, next: NextFunction) => {
        try {
            const topProducts = await SaleModel.aggregate([
                { $match: { orderStatus: "completed" } },
                { $unwind: "$items" },
                {
                    $group: {
                        _id: "$items.product",
                        name: { $first: "$items.name" },
                        totalQuantity: { $sum: "$items.quantity" },
                        totalRevenue: { $sum: "$items.total" }
                    }
                },
                { $sort: { totalQuantity: -1 } },
                { $limit: 6 }
            ]);

            res.json({
                data: topProducts,
                message: "Top selling products retrieved",
                meta: null
            });
        } catch (exception) {
            next(exception);
        }
    };
}

export default DashboardController;
