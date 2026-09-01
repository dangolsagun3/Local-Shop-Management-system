"use client";

import React, { useState } from "react";
import { X, Barcode, Search, Sparkles, CheckCircle2 } from "lucide-react";
import { Product } from "../types";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcodeOrSku: string) => void;
  availableProducts: Product[];
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  availableProducts
}) => {
  const [inputCode, setInputCode] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      onScan(inputCode.trim());
      setInputCode("");
      onClose();
    }
  };

  const handleQuickPick = (code: string) => {
    onScan(code);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Barcode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Barcode / SKU Scanner</h3>
              <p className="text-xs text-slate-400">Scan or type item barcode for instant POS add</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Enter or Scan Barcode / SKU
              </label>
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. 890103001001 or SKU-..."
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <Barcode className="w-5 h-5 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center justify-center gap-2 shadow-md"
            >
              <Search className="w-4 h-4" />
              <span>Lookup & Add to Cart</span>
            </button>
          </form>

          {/* Quick Simulation Barcodes */}
          <div className="pt-3 border-t border-slate-800">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Quick Barcode Presets in Store:
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {availableProducts.slice(0, 6).map((p) => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => handleQuickPick(p.barcode || p.sku)}
                  className="w-full p-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/60 flex items-center justify-between text-left transition group"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-medium text-white truncate">{p.name}</p>
                    <p className="text-[10px] font-mono text-emerald-400">
                      {p.barcode || p.sku}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-slate-300 group-hover:text-emerald-400 flex-shrink-0">
                    Scan +
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
