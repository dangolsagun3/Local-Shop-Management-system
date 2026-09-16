"use client";

import React, { useCallback, useEffect, useState } from "react";
import { X, Barcode, Search, Camera, CameraOff, Package, CheckCircle2 } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
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
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const findProduct = useCallback((code: string) => {
    const normalizedCode = code.trim().toLowerCase();
    return availableProducts.find(
      (product) =>
        product.barcode?.toLowerCase() === normalizedCode ||
        (product.barcode?.length === 12 && normalizedCode.startsWith(product.barcode)) ||
        product.sku?.toLowerCase() === normalizedCode
    ) || null;
  }, [availableProducts]);

  const handleCode = useCallback((code: string) => {
    const product = findProduct(code);
    setMatchedProduct(product);
    setInputCode(code);
    onScan(code);
  }, [findProduct, onScan]);

  const handleClose = () => {
    setInputCode("");
    setMatchedProduct(null);
    setIsCameraOpen(false);
    onClose();
  };

  useEffect(() => {
    if (!isOpen || !isCameraOpen) return;

    const scanner = new Html5Qrcode("pos-barcode-reader");
    let isStopped = false;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 120 } },
        (decodedText) => {
          if (!isStopped) {
            handleCode(decodedText);
            isStopped = true;
            scanner.stop().catch(() => undefined);
            setIsCameraOpen(false);
          }
        },
        () => undefined
      )
      .catch(() => {
        setIsCameraOpen(false);
      });

    return () => {
      isStopped = true;
      scanner.stop().catch(() => undefined);
    };
  }, [handleCode, isCameraOpen, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      handleCode(inputCode.trim());
    }
  };

  const handleQuickPick = (code: string) => {
    handleCode(code);
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
          <button onClick={handleClose} className="text-slate-400 hover:text-white">
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

          <div className="border-t border-slate-800 pt-3 space-y-2">
            <button
              type="button"
              onClick={() => setIsCameraOpen((open) => !open)}
              className="w-full py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              {isCameraOpen ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
              {isCameraOpen ? "Stop Camera" : "Scan with Camera"}
            </button>
            {isCameraOpen && (
              <div id="pos-barcode-reader" className="overflow-hidden rounded-xl border border-slate-700 bg-black" />
            )}
          </div>

          {matchedProduct && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3">
              <div className="flex items-center gap-2 mb-2 text-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-bold">Product found</span>
              </div>
              <div className="flex items-start gap-2">
                <Package className="w-5 h-5 text-emerald-400 mt-0.5" />
                <div className="min-w-0 text-xs">
                  <p className="font-bold text-white truncate">{matchedProduct.name}</p>
                  <p className="text-slate-300">SKU: {matchedProduct.sku}</p>
                  <p className="text-slate-300">Barcode: {matchedProduct.barcode || "-"}</p>
                  <p className="text-emerald-300 font-semibold">
                    Price: {matchedProduct.price - (matchedProduct.discount || 0)} | Stock: {matchedProduct.stock} {matchedProduct.unit}
                  </p>
                </div>
              </div>
            </div>
          )}

          {inputCode && !matchedProduct && (
            <p className="text-xs text-rose-300">No product details found for this barcode or SKU.</p>
          )}

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
