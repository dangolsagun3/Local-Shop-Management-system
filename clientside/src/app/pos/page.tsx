"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  PauseCircle,
  PlayCircle,
  CreditCard,
  Banknote,
  Smartphone,
  BookOpen,
  Printer,
  X,
  Package,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  User,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import { useCart } from "../../context/CartContext";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
import { posService } from "../../services/posService";
import { Product, Category, Sale } from "../../types";
import { ReceiptModal } from "../../components/ReceiptModal";
import { BarcodeScannerModal } from "../../components/BarcodeScannerModal";
import toast from "react-hot-toast";

export default function POSPage() {
  const { user } = useAuth();
  const { settings, formatPrice } = useSettings();
  const {
    items,
    customer,
    paymentMethod,
    paidAmount,
    subtotal,
    discountTotal,
    taxAmount,
    total,
    changeDue,
    heldCarts,
    addItem,
    removeItem,
    updateQuantity,
    updateDiscount,
    setCustomer,
    setPaymentMethod,
    setPaidAmount,
    clearCart,
    holdCurrentCart,
    recallHeldCart,
    deleteHeldCart
  } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);

  // Modals & Popups
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isHeldModalOpen, setIsHeldModalOpen] = useState<boolean>(false);

  const fetchCatalog = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        productService.getProducts({ limit: 100 }),
        categoryService.getCategories({ limit: 100 })
      ]);
      if (prodRes.data) setProducts(prodRes.data);
      if (catRes.data) setCategories(catRes.data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load store products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== "all") {
        const catId = typeof p.category === "object" ? p.category?._id : p.category;
        if (catId !== selectedCategory) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.sku?.toLowerCase().includes(q);
        const matchesBarcode = p.barcode?.includes(q);
        if (!matchesName && !matchesSku && !matchesBarcode) return false;
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  // Handle Barcode Scan
  const handleBarcodeScan = (code: string) => {
    const found = products.find(
      (p) =>
        p.barcode === code ||
        p.sku?.toLowerCase() === code.toLowerCase() ||
        p.name.toLowerCase().includes(code.toLowerCase())
    );

    if (found) {
      if (found.stock <= 0) {
        toast.error(`'${found.name}' is out of stock!`);
        return;
      }
      const added = addItem(found, 1);
      if (added) {
        toast.success(`Scanned: ${found.name}`);
      } else {
        toast.error(`Cannot add more than available stock (${found.stock})`);
      }
    } else {
      toast.error(`No item found matching barcode/SKU: ${code}`);
    }
  };

  // Quick cash helpers
  const handleQuickCash = (amount: number) => {
    setPaidAmount(amount);
  };

  // Checkout process
  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Cart is empty! Add products to proceed.");
      return;
    }

    setIsCheckingOut(true);
    try {
      const payload = {
        customer: {
          name: customer.name.trim() || "Walk-in Customer",
          phone: customer.phone.trim(),
          email: customer.email?.trim(),
          address: customer.address?.trim()
        },
        items: items.map((i) => ({
          productId: i.product._id,
          name: i.product.name,
          price: i.price,
          quantity: i.quantity,
          discount: i.discount,
          total: i.total
        })),
        subtotal,
        discount: discountTotal,
        tax: taxAmount,
        totalAmount: total,
        paidAmount: paidAmount > 0 ? paidAmount : total,
        paymentMethod,
        notes: `POS transaction at ${settings.shopName}`
      };

      const res = await posService.createSale(payload as any);
      if (res.data) {
        setCompletedSale(res.data);
        toast.success("Sale completed successfully! Stock updated.");
        clearCart();
        fetchCatalog(); // Refresh available stocks
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to process sale");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      {/* Top POS Header */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between gap-4 flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition px-2 py-1 rounded-lg hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Link>
          <div className="h-5 w-px bg-slate-800" />
          <h1 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
            <span>POS Register</span>
            <span className="text-[10px] text-slate-400 font-normal hidden md:inline">
              ({settings.shopName})
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Held Carts Badge */}
          {heldCarts.length > 0 && (
            <button
              onClick={() => setIsHeldModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition animate-pulse"
            >
              <PauseCircle className="w-3.5 h-3.5" />
              <span>{heldCarts.length} Held Orders</span>
            </button>
          )}

          {/* Barcode scanner trigger */}
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
          >
            <Barcode className="w-4 h-4" />
            <span className="hidden sm:inline">Scan Barcode</span>
          </button>
        </div>
      </header>

      {/* Main Workspace (Split: Left Catalog, Right Cart) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Product Catalog & Category Nav */}
        <section className="flex-1 flex flex-col min-w-0 border-r border-slate-800 bg-slate-950">
          {/* Search & Category Pills */}
          <div className="p-3 border-b border-slate-800 bg-slate-900/50 space-y-2.5">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search products by title, SKU, or barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 hover:text-white absolute right-3 top-2.5 text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === "all"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-750 hover:text-white"
                }`}
              >
                All Products ({products.length})
              </button>

              {categories.map((c) => (
                <button
                  key={c._id}
                  onClick={() => setSelectedCategory(c._id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === c._id
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-750 hover:text-white"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 content-start">
            {filteredProducts.map((p) => {
              const isOutOfStock = p.stock <= 0;
              const hasDiscount = p.discount > 0;
              const displayPrice = p.price - (p.discount || 0);

              return (
                <button
                  key={p._id}
                  disabled={isOutOfStock}
                  onClick={() => {
                    const added = addItem(p, 1);
                    if (!added) {
                      toast.error(`Cannot add more than available stock (${p.stock})`);
                    }
                  }}
                  className={`flex flex-col text-left p-2.5 rounded-2xl border transition-all duration-150 relative group ${
                    isOutOfStock
                      ? "bg-slate-900/40 border-slate-800/50 opacity-60 cursor-not-allowed"
                      : "bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-emerald-500/50 shadow-sm hover:shadow-emerald-950/20 active:scale-95"
                  }`}
                >
                  {/* Image / Thumbnail */}
                  <div className="w-full aspect-square rounded-xl bg-slate-800 overflow-hidden mb-2 relative flex items-center justify-center">
                    {p.imageUrl || (p.image as any)?.url ? (
                      <img
                        src={p.imageUrl || (p.image as any)?.url}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          (e.target as any).style.display = "none";
                        }}
                      />
                    ) : (
                      <Package className="w-8 h-8 text-slate-600" />
                    )}

                    {/* Stock badge */}
                    <span
                      className={`absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-md ${
                        p.stock <= 0
                          ? "bg-rose-950/80 text-rose-300 border border-rose-800/50"
                          : p.stock <= p.lowStockThreshold
                          ? "bg-amber-950/80 text-amber-300 border border-amber-800/50"
                          : "bg-slate-950/80 text-slate-300 border border-slate-800/50"
                      }`}
                    >
                      {p.stock} {p.unit}
                    </span>

                    {/* Discount badge */}
                    {hasDiscount && (
                      <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500 text-slate-950">
                        -{settings.currency}{p.discount} OFF
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <h3 className="font-semibold text-xs text-white line-clamp-2 leading-tight mb-1">
                      {p.name}
                    </h3>
                    <div className="flex items-baseline justify-between mt-auto">
                      <div>
                        <span className="font-bold text-sm text-emerald-400">
                          {formatPrice(displayPrice)}
                        </span>
                        {hasDiscount && (
                          <span className="text-[10px] text-slate-500 line-through block leading-none">
                            {formatPrice(p.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {filteredProducts.length === 0 && !isLoading && (
              <div className="col-span-full py-12 text-center text-xs text-slate-500">
                No products found matching your search. Try another query or add new items.
              </div>
            )}
          </div>
        </section>

        {/* RIGHT: Active Checkout Cart Panel */}
        <aside className="w-80 sm:w-96 flex flex-col bg-slate-900 border-l border-slate-800 flex-shrink-0">
          {/* Cart Header */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wide text-white">
                Current Cart ({items.length})
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <>
                  <button
                    onClick={() => holdCurrentCart()}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition text-[11px] flex items-center gap-1 font-semibold"
                    title="Hold current order"
                  >
                    <PauseCircle className="w-3.5 h-3.5" />
                    <span>Hold</span>
                  </button>
                  <button
                    onClick={clearCart}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                    title="Clear entire cart"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Customer Input (Walk-in / Custom) */}
          <div className="px-3.5 py-2 border-b border-slate-800 bg-slate-900/60 flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Customer Name (e.g. Regular Buyer)"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              className="w-1/2 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <input
              type="tel"
              placeholder="Phone (Optional)"
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              className="w-1/2 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Cart Itemized List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {items.map((item) => (
              <div
                key={item.product._id}
                className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-white truncate">
                      {item.product.name}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {formatPrice(item.price - item.discount)} / {item.product.unit}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 flex-shrink-0">
                    {formatPrice(item.total)}
                  </span>
                </div>

                {/* Qty & Line controls */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-850">
                  <div className="flex items-center gap-1.5 bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => {
                        const updated = updateQuantity(item.product._id, item.quantity + 1);
                        if (!updated) toast.error("Stock limit reached!");
                      }}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.product._id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <ShoppingCart className="w-10 h-10 mb-2 stroke-1 text-slate-600" />
                <p className="text-xs font-semibold text-slate-400">Cart is empty</p>
                <p className="text-[11px] mt-1">
                  Click product tiles or scan a barcode to add items.
                </p>
              </div>
            )}
          </div>

          {/* Payment & Totals Footer */}
          <div className="p-3.5 border-t border-slate-800 bg-slate-950/80 space-y-3">
            {/* Totals Breakdown */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Discount:</span>
                  <span>-{formatPrice(discountTotal)}</span>
                </div>
              )}
              {taxAmount > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>Tax ({settings.taxPercent}%):</span>
                  <span>+{formatPrice(taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-white pt-1.5 border-t border-slate-800">
                <span>Total Amount:</span>
                <span className="text-emerald-400">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-4 gap-1 pt-1">
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`py-1.5 rounded-lg text-[10px] font-bold border flex flex-col items-center gap-1 transition ${
                  paymentMethod === "cash"
                    ? "bg-emerald-600 text-white border-emerald-500"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750"
                }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`py-1.5 rounded-lg text-[10px] font-bold border flex flex-col items-center gap-1 transition ${
                  paymentMethod === "card"
                    ? "bg-sky-600 text-white border-sky-500"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("online")}
                className={`py-1.5 rounded-lg text-[10px] font-bold border flex flex-col items-center gap-1 transition ${
                  paymentMethod === "online"
                    ? "bg-purple-600 text-white border-purple-500"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Online/UPI</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("credit")}
                className={`py-1.5 rounded-lg text-[10px] font-bold border flex flex-col items-center gap-1 transition ${
                  paymentMethod === "credit"
                    ? "bg-amber-600 text-white border-amber-500"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Khata/Due</span>
              </button>
            </div>

            {/* Quick Cash Tender calculator (if Cash) */}
            {paymentMethod === "cash" && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between gap-1 text-[11px]">
                  <span className="text-slate-400">Cash Received:</span>
                  <input
                    type="number"
                    min="0"
                    placeholder={String(Math.ceil(total))}
                    value={paidAmount || ""}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="w-24 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-white text-right font-bold focus:outline-none"
                  />
                </div>
                {changeDue > 0 && (
                  <div className="flex justify-between text-xs font-bold text-amber-400">
                    <span>Change Due:</span>
                    <span>{formatPrice(changeDue)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Complete Sale Button */}
            <button
              type="button"
              disabled={items.length === 0 || isCheckingOut}
              onClick={handleCheckout}
              className="w-full py-3 rounded-xl font-extrabold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/60 transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isCheckingOut ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Checkout ({formatPrice(total)})</span>
                </>
              )}
            </button>
          </div>
        </aside>
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScan}
        availableProducts={products}
      />

      {/* Held Carts Modal */}
      {isHeldModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PauseCircle className="w-4 h-4 text-amber-400" />
                Held / Parked Orders
              </h3>
              <button onClick={() => setIsHeldModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
              {heldCarts.map((h) => (
                <div
                  key={h.id}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{h.customer.name}</h4>
                    <span className="text-[10px] text-slate-400">
                      {h.items.length} items • {h.savedAt} • {formatPrice(h.total)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        recallHeldCart(h.id);
                        setIsHeldModalOpen(false);
                        toast.success("Recalled held cart!");
                      }}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      Resume
                    </button>
                    <button
                      onClick={() => deleteHeldCart(h.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={!!completedSale}
        onClose={() => setCompletedSale(null)}
        sale={completedSale}
      />
    </div>
  );
}
