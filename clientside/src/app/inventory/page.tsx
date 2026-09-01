"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Boxes,
  AlertTriangle,
  Package,
  Plus,
  Minus,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Sidebar } from "../../components/Sidebar";
import { Navbar } from "../../components/Navbar";
import { StockAdjustModal } from "../../components/StockAdjustModal";
import { productService } from "../../services/productService";
import { dashboardService } from "../../services/dashboardService";
import { useSettings } from "../../context/SettingsContext";
import { Product, DashboardStats } from "../../types";
import toast from "react-hot-toast";

export default function InventoryPage() {
  const { formatPrice, settings } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [filterType, setFilterType] = useState<"all" | "low" | "out">("all");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    try {
      const [prodRes, statsRes] = await Promise.all([
        productService.getProducts({
          limit: 100,
          search: search.trim() || undefined,
          low_stock: filterType !== "all" ? "true" : undefined
        }),
        dashboardService.getStats()
      ]);

      if (prodRes.data) setProducts(prodRes.data);
      if (statsRes.data) setStats(statsRes.data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load inventory");
    } finally {
      setIsLoading(false);
    }
  }, [search, filterType]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const filteredProducts = products.filter((p) => {
    if (filterType === "out") return p.stock <= 0;
    if (filterType === "low") return p.stock <= p.lowStockThreshold && p.stock > 0;
    return true;
  });

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Boxes className="w-6 h-6 text-teal-400" />
              Inventory & Stock Health Ledger
            </h1>
            <p className="text-xs text-slate-400">
              Audit current warehouse/shelf stock, monitor threshold alerts, and track valuation.
            </p>
          </div>

          {/* Valuation Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <span className="text-xs text-slate-400 uppercase font-semibold">Total Stock Units</span>
              <p className="text-2xl font-black text-white mt-1">
                {stats?.inventory.totalStockUnits || 0} Units
              </p>
              <span className="text-[11px] text-slate-500">Across {stats?.inventory.totalProducts || 0} items</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <span className="text-xs text-slate-400 uppercase font-semibold">Total Cost Investment</span>
              <p className="text-2xl font-black text-sky-400 mt-1">
                {formatPrice(stats?.inventory.costValuation || 0)}
              </p>
              <span className="text-[11px] text-slate-500">Supplier cost value</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <span className="text-xs text-slate-400 uppercase font-semibold">Expected Retail Value</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                {formatPrice(stats?.inventory.retailValuation || 0)}
              </p>
              <span className="text-[11px] text-emerald-400 font-semibold">
                +{formatPrice(stats?.inventory.estimatedProfit || 0)} Profit margin
              </span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-80 relative">
              <input
                type="text"
                placeholder="Search stock item or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  filterType === "all"
                    ? "bg-slate-800 text-white border border-slate-700"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All Stock ({products.length})
              </button>

              <button
                onClick={() => setFilterType("low")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                  filterType === "low"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-slate-400 hover:text-amber-400"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Low Stock</span>
              </button>

              <button
                onClick={() => setFilterType("out")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                  filterType === "out"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    : "text-slate-400 hover:text-rose-400"
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Out of Stock</span>
              </button>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Cost</th>
                    <th className="py-3 px-4">Retail</th>
                    <th className="py-3 px-4">Current Stock</th>
                    <th className="py-3 px-4">Stock Valuation</th>
                    <th className="py-3 px-4">Health Status</th>
                    <th className="py-3 px-4 text-right">Quick Restock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredProducts.map((p) => {
                    const isLow = p.stock <= p.lowStockThreshold && p.stock > 0;
                    const isOut = p.stock <= 0;
                    const totalCostVal = p.costPrice * p.stock;
                    const totalRetailVal = p.price * p.stock;

                    return (
                      <tr key={p._id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-semibold text-white truncate max-w-[200px]">
                          {p.name}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">{p.sku}</td>
                        <td className="py-3 px-4 text-slate-400">{formatPrice(p.costPrice)}</td>
                        <td className="py-3 px-4 text-emerald-400 font-semibold">{formatPrice(p.price)}</td>
                        <td className="py-3 px-4 font-bold text-white text-sm">
                          {p.stock} {p.unit}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          <span className="font-semibold text-emerald-400 block">{formatPrice(totalRetailVal)}</span>
                          <span className="text-[10px] text-slate-500">Cost: {formatPrice(totalCostVal)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-bold px-2 py-0.5 rounded-full text-[10px] inline-flex items-center gap-1 ${
                              isOut
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                : isLow
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedProduct(p)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition"
                          >
                            + Stock In / Out
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Stock Adjust Modal */}
      <StockAdjustModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
        onSuccess={() => fetchInventory()}
      />
    </div>
  );
}
