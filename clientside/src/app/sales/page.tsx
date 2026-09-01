"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Receipt,
  Search,
  Filter,
  Calendar,
  Eye,
  Printer,
  Ban,
  DollarSign,
  Download,
  CreditCard,
  Banknote,
  Smartphone,
  BookOpen,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Sidebar } from "../../components/Sidebar";
import { Navbar } from "../../components/Navbar";
import { ReceiptModal } from "../../components/ReceiptModal";
import { DeleteConfirmModal } from "../../components/DeleteConfirmModal";
import { posService } from "../../services/posService";
import { useSettings } from "../../context/SettingsContext";
import { Sale } from "../../types";
import toast from "react-hot-toast";

export default function SalesPage() {
  const { settings, formatPrice } = useSettings();

  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [orderStatus, setOrderStatus] = useState("all");
  const [timeFilter, setTimeFilter] = useState<"all" | "today">("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [selectedSaleForReceipt, setSelectedSaleForReceipt] = useState<Sale | null>(null);
  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchSales = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await posService.getSales({
        page,
        limit: 20,
        search: search.trim() || undefined,
        paymentMethod: paymentMethod !== "all" ? paymentMethod : undefined,
        orderStatus: orderStatus !== "all" ? orderStatus : undefined,
        today: timeFilter === "today" ? "true" : undefined
      });

      if (res.data) {
        setSales(res.data);
        if (res.meta?.pagination) {
          setTotalPages(res.meta.pagination.totalPages || 1);
          setTotalCount(res.meta.pagination.total || res.data.length);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load sales");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, paymentMethod, orderStatus, timeFilter]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handleCancelSale = async () => {
    if (!saleToCancel) return;
    setIsCancelling(true);
    try {
      await posService.cancelSale(saleToCancel._id);
      toast.success(`Invoice ${saleToCancel.invoiceNumber} cancelled and stock restored!`);
      setSaleToCancel(null);
      fetchSales();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel sale");
    } finally {
      setIsCancelling(false);
    }
  };

  const totalFilteredRevenue = sales
    .filter((s) => s.orderStatus === "completed")
    .reduce((acc, s) => acc + s.totalAmount, 0);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <Receipt className="w-6 h-6 text-emerald-400" />
                Sales Invoices & Transactions
              </h1>
              <p className="text-xs text-slate-400">
                Full sales audit log, thermal receipt generator, and transaction history ({totalCount} total).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
              <span className="text-xs text-slate-400">Filtered Sales Revenue:</span>
              <span className="text-base font-extrabold text-emerald-400">
                {formatPrice(totalFilteredRevenue)}
              </span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Search */}
              <div className="sm:col-span-2 relative">
                <input
                  type="text"
                  placeholder="Search by Invoice # (INV-...), Customer Name, or Phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              {/* Payment Method Filter */}
              <div>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Payment Methods</option>
                  <option value="cash">Cash Only</option>
                  <option value="card">Card</option>
                  <option value="online">Online / UPI</option>
                  <option value="credit">Khata / Credit (Due)</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Orders</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled / Voided</option>
                </select>
              </div>
            </div>

            {/* Quick time filter */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400 font-semibold">Time:</span>
              <button
                onClick={() => setTimeFilter("all")}
                className={`px-2.5 py-1 rounded-lg transition ${
                  timeFilter === "all" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setTimeFilter("today")}
                className={`px-2.5 py-1 rounded-lg transition ${
                  timeFilter === "today" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                Today Only
              </button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {sales.map((s) => {
                    const isCancelled = s.orderStatus === "cancelled";

                    return (
                      <tr key={s._id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          {s.invoiceNumber}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(s.createdAt).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-white block truncate max-w-[150px]">
                            {s.customer?.name || "Walk-in Customer"}
                          </span>
                          {s.customer?.phone && (
                            <span className="text-[10px] text-slate-500">{s.customer.phone}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          <span className="font-semibold">{s.items.length} Items</span>
                          <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">
                            {s.items.map((i) => i.name).join(", ")}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="capitalize font-semibold text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {s.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-white text-sm">
                          {formatPrice(s.totalAmount)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`capitalize font-bold text-[10px] px-2 py-0.5 rounded-full ${
                              isCancelled
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {s.orderStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedSaleForReceipt(s)}
                              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
                              title="Print Thermal Receipt"
                            >
                              <Printer className="w-4 h-4 text-emerald-400" />
                            </button>
                            {!isCancelled && (
                              <button
                                onClick={() => setSaleToCancel(s)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                                title="Void Sale & Restore Stock"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {sales.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-slate-500">
                        No sales transactions found for this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Page {page} of {totalPages} ({totalCount} invoices)
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Thermal Receipt Print Modal */}
      <ReceiptModal
        isOpen={!!selectedSaleForReceipt}
        onClose={() => setSelectedSaleForReceipt(null)}
        sale={selectedSaleForReceipt}
      />

      {/* Cancel Sale Confirmation */}
      <DeleteConfirmModal
        isOpen={!!saleToCancel}
        onClose={() => setSaleToCancel(null)}
        onConfirm={handleCancelSale}
        title="Void & Refund Sale"
        message="Are you sure you want to void this invoice? All product inventory items will be automatically returned to store stock."
        itemName={saleToCancel?.invoiceNumber}
        isLoading={isCancelling}
      />
    </div>
  );
}
