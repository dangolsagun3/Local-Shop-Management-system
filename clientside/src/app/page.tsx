"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Store,
  ShoppingCart,
  Package,
  Boxes,
  Receipt,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Database,
  CheckCircle2,
  Zap,
  BarChart3,
  Barcode
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { dashboardService } from "../services/dashboardService";
import { DashboardStats } from "../types";

export default function LandingPage() {
  const { user } = useAuth();
  const { settings, formatPrice } = useSettings();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    dashboardService.getStats().then((res) => {
      if (res.data) setStats(res.data);
    }).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 flex flex-col justify-between">
      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-950/60">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                Shop<span className="text-emerald-400">X</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Local Shop Management
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/50 transition"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-950/50 transition"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Complete Local Store & Supermarket Suite</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none">
            Smart Retail POS & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Inventory System for {settings.shopName}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Manage your daily retail shop with lightning-fast POS checkout, dynamic barcode scanning, inventory valuation, invoice printing, customer khata ledger, and live MongoDB integration.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/pos"
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-xl shadow-emerald-500/20 transition transform hover:-translate-y-0.5"
            >
              <ShoppingCart className="w-5 h-5 text-slate-950" />
              <span>Launch POS Terminal</span>
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
            >
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span>Store Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Live Metrics Grid Preview */}
        {stats && (
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto w-full">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-xs text-slate-400 uppercase font-semibold">Total Revenue</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                {formatPrice(stats.revenue.total)}
              </p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-xs text-slate-400 uppercase font-semibold">Total Invoices</span>
              <p className="text-xl sm:text-2xl font-black text-sky-400 mt-1">
                {stats.orders.total} Sales
              </p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-xs text-slate-400 uppercase font-semibold">Store Items</span>
              <p className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
                {stats.inventory.totalProducts} Products
              </p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-xs text-slate-400 uppercase font-semibold">Stock Units</span>
              <p className="text-xl sm:text-2xl font-black text-purple-400 mt-1">
                {stats.inventory.totalStockUnits} Units
              </p>
            </div>
          </div>
        )}

        {/* Core Capabilities feature grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">High-Speed POS Checkout</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scan barcodes or click quick tiles, calculate discounts, handle split/cash/online payments, and generate thermal receipts in seconds.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Full Product & Inventory CRUD</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Add new products, update prices, upload product pictures, configure cost & selling margins, and monitor low stock alerts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Invoices & Khata Due Ledger</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track customer credit (Khata), print thermal 80mm receipts, reprint past invoices, and void orders with automatic stock restoral.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>© 2026 {settings.shopName} • Powered by ShopX Next.js & Express MongoDB</p>
      </footer>
    </div>
  );
}
