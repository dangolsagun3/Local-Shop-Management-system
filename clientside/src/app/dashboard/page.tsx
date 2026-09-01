"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  Receipt,
  TrendingUp,
  PlusCircle,
  Sparkles,
  ArrowRight,
  Boxes,
  Eye,
  RotateCcw,
  Store,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Sidebar } from "../../components/Sidebar";
import { Navbar } from "../../components/Navbar";
import { StatCard } from "../../components/StatCard";
import { ProductModal } from "../../components/ProductModal";
import { StockAdjustModal } from "../../components/StockAdjustModal";
import { ReceiptModal } from "../../components/ReceiptModal";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import { dashboardService } from "../../services/dashboardService";
import { productService } from "../../services/productService";
import { DashboardStats, ChartDataPoint, Sale, Product } from "../../types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const { user } = useAuth();
  const { settings, formatPrice } = useSettings();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState<Product | null>(null);
  const [selectedSaleForReceipt, setSelectedSaleForReceipt] = useState<Sale | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, chartRes, recentRes, lowStockRes, topRes] = await Promise.allSettled([
        dashboardService.getStats(),
        dashboardService.getChart(7),
        dashboardService.getRecentActivities(),
        productService.getLowStockProducts(),
        dashboardService.getTopProducts()
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value?.data) {
        setStats(statsRes.value.data);
      }
      if (chartRes.status === "fulfilled" && chartRes.value?.data) {
        setChartData(chartRes.value.data);
      }
      if (recentRes.status === "fulfilled" && recentRes.value?.data) {
        setRecentSales(recentRes.value.data);
      }
      if (lowStockRes.status === "fulfilled" && lowStockRes.value?.data) {
        setLowStockProducts(lowStockRes.value.data);
      }
      if (topRes.status === "fulfilled" && topRes.value?.data) {
        setTopProducts(topRes.value.data);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleStockRestockClick = (prod: Product) => {
    setSelectedProductForStock(prod);
    setIsStockModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar lowStockCount={stats?.inventory.lowStockCount || lowStockProducts.length} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar onOpenNewProductModal={() => setIsProductModalOpen(true)} />

        {/* Dashboard Scroll Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Welcome Banner & Quick Action Buttons */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 shadow-xl">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Welcome back, {user?.name || "Shop Manager"}!
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live POS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Here is the real-time sales overview and inventory health for {settings.shopName}.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <Link
                href="/pos"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/60 transition"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Open POS Terminal</span>
              </Link>
              <button
                onClick={() => setIsProductModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Today's Revenue"
              value={formatPrice(stats?.revenue.today || 0)}
              subtitle={`Total: ${formatPrice(stats?.revenue.total || 0)}`}
              icon={DollarSign}
              colorTheme="emerald"
              badge={`${stats?.orders.today || 0} Orders Today`}
            />

            <StatCard
              title="Monthly Sales"
              value={formatPrice(stats?.revenue.thisMonth || 0)}
              subtitle={`${stats?.orders.thisMonth || 0} orders this month`}
              icon={Receipt}
              colorTheme="blue"
            />

            <StatCard
              title="Total Inventory Items"
              value={stats?.inventory.totalProducts || 0}
              subtitle={`${stats?.inventory.totalStockUnits || 0} units in stock`}
              icon={Package}
              colorTheme="purple"
            />

            <StatCard
              title="Low Stock Alerts"
              value={stats?.inventory.lowStockCount || lowStockProducts.length}
              subtitle={`${stats?.inventory.outOfStockCount || 0} Out of stock`}
              icon={AlertTriangle}
              colorTheme={
                (stats?.inventory.lowStockCount || 0) > 0 ? "amber" : "emerald"
              }
              badge={
                (stats?.inventory.lowStockCount || 0) > 0
                  ? "Action Required"
                  : "Stock Optimal"
              }
            />
          </div>

          {/* Charts & Store Leaderboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Trend Chart (2 Cols) */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    7-Day Sales & Revenue Trend
                  </h2>
                  <p className="text-xs text-slate-400">
                    Daily sales performance graph
                  </p>
                </div>
                <div className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {settings.currency} Currency
                </div>
              </div>

              {/* Chart */}
              <div className="h-64 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `${val}`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: "0.75rem",
                          fontSize: "12px",
                          color: "#f8fafc"
                        }}
                        formatter={(value: any) => [`${settings.currency} ${value}`, "Revenue"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#revenueGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    No sales data recorded yet.
                  </div>
                )}
              </div>
            </div>

            {/* Inventory Valuation & Quick Health */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-teal-400" />
                  Store Valuation & Margins
                </h2>
                <p className="text-xs text-slate-400">Inventory investment analysis</p>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Total Retail Valuation</span>
                  <span className="text-xl font-extrabold text-emerald-400">
                    {formatPrice(stats?.inventory.retailValuation || 0)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Total Supplier Cost</span>
                  <span className="text-lg font-bold text-slate-300">
                    {formatPrice(stats?.inventory.costValuation || 0)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
                  <span className="text-xs text-emerald-300 block font-semibold">
                    Expected Gross Profit Potential
                  </span>
                  <span className="text-lg font-extrabold text-emerald-400">
                    {formatPrice(stats?.inventory.estimatedProfit || 0)}
                  </span>
                </div>
              </div>

              <Link
                href="/inventory"
                className="w-full py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 text-center transition block"
              >
                View Full Inventory Ledger →
              </Link>
            </div>
          </div>

          {/* Low Stock Warnings Table */}
          {lowStockProducts.length > 0 && (
            <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Low Stock Warnings</h2>
                    <p className="text-xs text-slate-400">
                      The following {lowStockProducts.length} items need restock soon:
                    </p>
                  </div>
                </div>

                <Link
                  href="/inventory"
                  className="text-xs font-semibold text-amber-400 hover:underline"
                >
                  Manage All Inventory →
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3 rounded-l-lg">Product Name</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Current Stock</th>
                      <th className="py-2.5 px-3">Threshold</th>
                      <th className="py-2.5 px-3">Price</th>
                      <th className="py-2.5 px-3 rounded-r-lg text-right">Quick Restock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {lowStockProducts.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-semibold text-white truncate max-w-[200px]">
                          {p.name}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{p.sku}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                              p.stock <= 0
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {p.stock} {p.unit} ({p.stock <= 0 ? "Out of Stock" : "Low"})
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{p.lowStockThreshold}</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-semibold">
                          {formatPrice(p.price)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleStockRestockClick(p)}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow-sm"
                          >
                            + Restock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Transactions Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  Recent Sales & Invoices
                </h2>
                <p className="text-xs text-slate-400">Latest completed store sales</p>
              </div>
              <Link
                href="/sales"
                className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>View All Invoices</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3 rounded-l-lg">Invoice #</th>
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Items</th>
                    <th className="py-2.5 px-3">Payment</th>
                    <th className="py-2.5 px-3">Total Amount</th>
                    <th className="py-2.5 px-3 rounded-r-lg text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {recentSales.length > 0 ? (
                    recentSales.map((s) => (
                      <tr key={s._id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                          {s.invoiceNumber}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {new Date(s.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>
                        <td className="py-2.5 px-3 text-white font-medium">
                          {s.customer?.name || "Walk-in Customer"}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {s.items.length} item(s)
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                            {s.paymentMethod}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-white">
                          {formatPrice(s.totalAmount)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => setSelectedSaleForReceipt(s)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="View / Print Receipt"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-slate-500">
                        No sales transactions completed yet. Open POS to make your first sale!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSuccess={() => {
          fetchDashboardData();
        }}
      />

      {/* Stock Adjust Modal */}
      <StockAdjustModal
        isOpen={isStockModalOpen}
        onClose={() => {
          setIsStockModalOpen(false);
          setSelectedProductForStock(null);
        }}
        product={selectedProductForStock}
        onSuccess={() => {
          fetchDashboardData();
        }}
      />

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={!!selectedSaleForReceipt}
        onClose={() => setSelectedSaleForReceipt(null)}
        sale={selectedSaleForReceipt}
      />
    </div>
  );
}
