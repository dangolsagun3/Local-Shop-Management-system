"use client";

import React, { useState } from "react";
import { X, Boxes, Plus, Minus, ArrowRight, CheckCircle2 } from "lucide-react";
import { Product } from "../types";
import { productService } from "../services/productService";
import toast from "react-hot-toast";

interface StockAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess: (updated: Product) => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess
}) => {
  const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract">("add");
  const [quantity, setQuantity] = useState<number | string>(10);
  const [reason, setReason] = useState<string>("Supplier Restock");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !product) return null;

  const numQty = Number(quantity) || 0;
  const changeAmount = adjustmentType === "add" ? numQty : -numQty;
  const newStock = Math.max(0, product.stock + changeAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numQty <= 0) {
      toast.error("Please enter a valid quantity greater than 0");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await productService.adjustStock(product._id, changeAmount, reason);
      toast.success(`Inventory updated for ${product.name}!`);
      if (res.data) onSuccess(res.data);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to adjust stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Adjust Stock Level</h3>
              <p className="text-xs text-slate-400 truncate max-w-[240px]">{product.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Current Stock Preview */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block">Current Stock</span>
              <span className="text-base font-bold text-white">
                {product.stock} {product.unit}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <div className="text-right">
              <span className="text-slate-400 block">New Stock</span>
              <span className="text-base font-bold text-emerald-400">
                {newStock} {product.unit}
              </span>
            </div>
          </div>

          {/* Type Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAdjustmentType("add")}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border transition ${
                adjustmentType === "add"
                  ? "bg-emerald-600 text-white border-emerald-500"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
              }`}
            >
              <Plus className="w-3.5 h-3.5" /> Restock / Add Stock
            </button>
            <button
              type="button"
              onClick={() => setAdjustmentType("subtract")}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border transition ${
                adjustmentType === "subtract"
                  ? "bg-rose-600 text-white border-rose-500"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
              }`}
            >
              <Minus className="w-3.5 h-3.5" /> Stock Out / Damage
            </button>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Quantity to {adjustmentType === "add" ? "Add" : "Deduct"} ({product.unit})
            </label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Reason / Reference
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Supplier Restock">Supplier Restock (New Shipment)</option>
              <option value="Inventory Audit Correction">Inventory Audit Correction</option>
              <option value="Damaged / Expired Goods">Damaged / Expired Goods</option>
              <option value="Internal Store Consumption">Internal Store Consumption</option>
              <option value="Customer Return">Customer Return</option>
            </select>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Updating..." : "Save Adjustment"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
