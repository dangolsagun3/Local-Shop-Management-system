"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Boxes,
  Download,
  LayoutGrid,
  List,
  AlertTriangle,
  Barcode,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Sidebar } from "../../components/Sidebar";
import { Navbar } from "../../components/Navbar";
import { ProductModal } from "../../components/ProductModal";
import { StockAdjustModal } from "../../components/StockAdjustModal";
import { DeleteConfirmModal } from "../../components/DeleteConfirmModal";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
import { useSettings } from "../../context/SettingsContext";
import { Product, Category } from "../../types";
import toast from "react-hot-toast";

export default function ProductsPage() {
  const { settings, formatPrice } = useSettings();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters & State
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToStock, setProductToStock] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await productService.getProducts({
        page,
        limit: 20,
        search: search.trim() || undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        low_stock: onlyLowStock ? "true" : undefined
      });

      if (res.data) {
        setProducts(res.data);
        if (res.meta?.pagination) {
          setTotalPages(res.meta.pagination.totalPages || 1);
          setTotalCount(res.meta.pagination.total || res.data.length);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, selectedCategory, selectedStatus, onlyLowStock]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    categoryService.getCategories().then((res) => {
      if (res.data) setCategories(res.data);
    }).catch(console.error);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await productService.deleteProduct(productToDelete._id);
      toast.success(`Product '${productToDelete.name}' deleted successfully`);
      setProductToDelete(null);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    if (products.length === 0) {
      toast.error("No products to export");
      return;
    }
    const headers = ["ID", "Name", "SKU", "Barcode", "Category", "CostPrice", "SellingPrice", "Discount", "Stock", "Unit", "Status"];
    const rows = products.map((p) => [
      p._id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.sku || "",
      p.barcode || "",
      typeof p.category === "object" ? p.category?.name : "",
      p.costPrice,
      p.price,
      p.discount,
      p.stock,
      p.unit,
      p.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `shopx_products_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Products exported to CSV successfully!");
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onOpenNewProductModal={() => { setProductToEdit(null); setIsProductModalOpen(true); }} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <Package className="w-6 h-6 text-emerald-400" />
                Store Product Catalog
              </h1>
              <p className="text-xs text-slate-400">
                Manage inventory, retail pricing, supplier costs, and SKU barcodes ({totalCount} total items).
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                <Download className="w-4 h-4 text-slate-400" />
                <span className="hidden md:inline">Export CSV</span>
              </button>

              <button
                onClick={() => {
                  setProductToEdit(null);
                  setIsProductModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/60 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {/* Search */}
              <div className="sm:col-span-2 relative">
                <input
                  type="text"
                  placeholder="Search by title, SKU, or barcode..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Sub Filter Row: Low Stock Toggle & View Mode */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 flex-wrap gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyLowStock}
                  onChange={(e) => setOnlyLowStock(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-800 border-slate-700"
                />
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Show Only Low Stock & Out of Stock Items
                </span>
              </label>

              <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-1 border border-slate-700">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === "table" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                  title="Table list view"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === "grid" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                  title="Card grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Content (Table or Grid) */}
          {viewMode === "table" ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Item</th>
                      <th className="py-3.5 px-4">SKU / Barcode</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Cost Price</th>
                      <th className="py-3.5 px-4">Selling Price</th>
                      <th className="py-3.5 px-4">Stock Level</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {products.map((p) => {
                      const isLow = p.stock <= p.lowStockThreshold && p.stock > 0;
                      const isOut = p.stock <= 0;

                      return (
                        <tr key={p._id} className="hover:bg-slate-800/40 transition">
                          {/* Item info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden flex items-center justify-center flex-shrink-0 border border-slate-700">
                                {p.imageUrl || (p.image as any)?.url ? (
                                  <img
                                    src={p.imageUrl || (p.image as any)?.url}
                                    alt={p.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as any).style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <Package className="w-5 h-5 text-slate-500" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-white text-xs block truncate max-w-[180px]">
                                  {p.name}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* SKU & Barcode */}
                          <td className="py-3 px-4 font-mono text-slate-400">
                            <div>{p.sku}</div>
                            {p.barcode && (
                              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                <Barcode className="w-3 h-3" /> {p.barcode}
                              </div>
                            )}
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4 text-slate-300">
                            {typeof p.category === "object" && p.category?.name ? (
                              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-semibold">
                                {p.category.name}
                              </span>
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </td>

                          {/* Cost */}
                          <td className="py-3 px-4 text-slate-400 font-medium">
                            {formatPrice(p.costPrice)}
                          </td>

                          {/* Selling Price */}
                          <td className="py-3 px-4">
                            <span className="font-bold text-emerald-400">
                              {formatPrice(p.price - (p.discount || 0))}
                            </span>
                            {p.discount > 0 && (
                              <span className="block text-[10px] text-slate-500 line-through">
                                {formatPrice(p.price)}
                              </span>
                            )}
                          </td>

                          {/* Stock */}
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
                              {p.stock} {p.unit}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <span
                              className={`capitalize font-semibold text-[10px] px-2 py-0.5 rounded-full ${
                                p.status === "active"
                                  ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                                  : p.status === "out_of_stock"
                                  ? "bg-rose-950/60 text-rose-400 border border-rose-800/40"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {p.status.replace(/_/g, " ")}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setProductToStock(p)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition"
                                title="Adjust Stock"
                              >
                                <Boxes className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setProductToEdit(p);
                                  setIsProductModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition"
                                title="Edit Product"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setProductToDelete(p)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {products.length === 0 && !isLoading && (
                      <tr>
                        <td colSpan={8} className="text-center py-10 text-slate-500">
                          No products found in this filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map((p) => (
                <div
                  key={p._id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between shadow-lg relative group hover:border-slate-700 transition"
                >
                  <div className="w-full aspect-square rounded-xl bg-slate-800 overflow-hidden mb-2 relative flex items-center justify-center">
                    {p.imageUrl || (p.image as any)?.url ? (
                      <img
                        src={p.imageUrl || (p.image as any)?.url}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-slate-600" />
                    )}

                    <span
                      className={`absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                        p.stock <= 0
                          ? "bg-rose-950/90 text-rose-300"
                          : p.stock <= p.lowStockThreshold
                          ? "bg-amber-950/90 text-amber-300"
                          : "bg-slate-950/90 text-slate-300"
                      }`}
                    >
                      {p.stock} {p.unit}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-xs text-white truncate mb-1">{p.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono mb-2">{p.sku}</p>

                    <div className="flex items-center justify-between border-t border-slate-800 pt-2">
                      <span className="font-bold text-sm text-emerald-400">
                        {formatPrice(p.price - (p.discount || 0))}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setProductToStock(p)}
                          className="p-1 rounded text-slate-400 hover:text-emerald-400"
                        >
                          <Boxes className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setProductToEdit(p);
                            setIsProductModalOpen(true);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-sky-400"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setProductToDelete(p)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Page {page} of {totalPages} ({totalCount} items)
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

      {/* Product Add/Edit Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
        onSuccess={() => {
          fetchProducts();
        }}
      />

      {/* Stock Adjust Modal */}
      <StockAdjustModal
        isOpen={!!productToStock}
        onClose={() => setProductToStock(null)}
        product={productToStock}
        onSuccess={() => {
          fetchProducts();
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Store Product"
        message="Are you sure you want to permanently delete this product from the store catalog?"
        itemName={productToDelete?.name}
        isLoading={isDeleting}
      />
    </div>
  );
}
