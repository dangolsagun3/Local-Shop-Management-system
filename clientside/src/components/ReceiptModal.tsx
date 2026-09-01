"use client";

import React from "react";
import { X, Printer, CheckCircle2, ShoppingBag, Download, Store } from "lucide-react";
import { Sale } from "../types";
import { useSettings } from "../context/SettingsContext";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, sale }) => {
  const { settings, formatPrice } = useSettings();

  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:border-none print:shadow-none print:w-full print:max-w-full">
        {/* Modal Header (Hidden during print) */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60 print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Invoice / POS Receipt</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Thermal Slip Area */}
        <div className="p-6 bg-white text-slate-900 font-mono text-xs overflow-y-auto max-h-[70vh] print:max-h-none print:p-0">
          {/* Shop Brand Header */}
          <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300">
            <h1 className="font-extrabold text-base uppercase tracking-wider text-slate-950">
              {settings.shopName}
            </h1>
            <p className="text-[11px] text-slate-600">{settings.shopAddress}</p>
            <p className="text-[11px] text-slate-600">
              Tel: {settings.shopPhone} | {settings.vatNumber}
            </p>
            <div className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
              TAX INVOICE / SALES RECEIPT
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="py-3 border-b border-dashed border-slate-300 text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice No:</span>
              <span className="font-bold">{sale.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date & Time:</span>
              <span>{new Date(sale.createdAt || Date.now()).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cashier:</span>
              <span>{sale.cashierName || (sale.cashier as any)?.name || "Store Staff"}</span>
            </div>
            {sale.customer?.name && (
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-medium">
                  {sale.customer.name} {sale.customer.phone ? `(${sale.customer.phone})` : ""}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Payment:</span>
              <span className="uppercase font-semibold text-emerald-700">{sale.paymentMethod}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-3 border-b border-dashed border-slate-300">
            <div className="grid grid-cols-12 font-bold text-[10px] uppercase text-slate-600 pb-1 mb-1 border-b border-slate-200">
              <span className="col-span-6">Item</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-2 text-right">Price</span>
              <span className="col-span-2 text-right">Total</span>
            </div>

            <div className="space-y-1.5 pt-1">
              {sale.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 text-[11px] leading-tight">
                  <div className="col-span-6 truncate pr-1">
                    <span className="font-medium">{item.name}</span>
                    {item.discount !== undefined && item.discount > 0 && (
                      <span className="block text-[9px] text-emerald-600">
                        (Disc -{settings.currency}{item.discount})
                      </span>
                    )}
                  </div>
                  <span className="col-span-2 text-center">
                    {item.quantity} {item.unit || "pcs"}
                  </span>
                  <span className="col-span-2 text-right">{item.price}</span>
                  <span className="col-span-2 text-right font-semibold">{item.total}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Totals */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>{formatPrice(sale.subtotal)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Total Discount:</span>
                <span>-{formatPrice(sale.discount)}</span>
              </div>
            )}
            {sale.tax > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Tax/VAT ({settings.taxPercent}%):</span>
                <span>+{formatPrice(sale.tax)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-slate-950 pt-1 border-t border-slate-200">
              <span>GRAND TOTAL:</span>
              <span>{formatPrice(sale.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-700 pt-1">
              <span>Amount Paid ({sale.paymentMethod}):</span>
              <span>{formatPrice(sale.paidAmount)}</span>
            </div>
            {sale.changeAmount > 0 && (
              <div className="flex justify-between text-slate-700 font-semibold">
                <span>Change Returned:</span>
                <span>{formatPrice(sale.changeAmount)}</span>
              </div>
            )}
            {sale.dueAmount > 0 && (
              <div className="flex justify-between text-rose-600 font-bold">
                <span>Khata Due / Balance:</span>
                <span>{formatPrice(sale.dueAmount)}</span>
              </div>
            )}
          </div>

          {/* Barcode Simulation & Footer */}
          <div className="pt-4 text-center space-y-2">
            <div className="font-mono text-[10px] tracking-widest text-slate-700 bg-slate-100 py-1.5 rounded">
              ||| ||||| |||| |||||| ||| ||||||| |||
              <br />
              {sale.invoiceNumber}
            </div>
            <p className="text-[10px] text-slate-500 italic">
              {settings.receiptFooter}
            </p>
            <p className="text-[9px] text-slate-400">
              Powered by ShopX Management System
            </p>
          </div>
        </div>

        {/* Modal Footer Controls (Hidden during print) */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
