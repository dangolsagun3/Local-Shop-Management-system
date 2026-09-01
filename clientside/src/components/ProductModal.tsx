"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Package,
  Upload,
  Sparkles,
  Barcode,
  DollarSign,
  Boxes,
  Tag,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Percent
} from "lucide-react";
import { Product, Category, Brand } from "../types";
import { productService } from "../services/productService";
import { categoryService } from "../services/categoryService";
import { brandService } from "../services/brandService";
import { useSettings } from "../context/SettingsContext";
import toast from "react-hot-toast";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (product: Product) => void;
  productToEdit?: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  productToEdit
}) => {
  const { settings, formatPrice } = useSettings();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [costPrice, setCostPrice] = useState<number | string>(0);
  const [price, setPrice] = useState<number | string>(0);
  const [discount, setDiscount] = useState<number | string>(0);
  const [stock, setStock] = useState<number | string>(10);
  const [lowStockThreshold, setLowStockThreshold] = useState<number | string>(5);
  const [unit, setUnit] = useState("pcs");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [status, setStatus] = useState<"active" | "inactive" | "out_of_stock">("active");
  const [featured, setFeatured] = useState<boolean>(false);

  // Load categories and brands
  useEffect(() => {
    if (isOpen) {
      categoryService.getCategories().then((res) => {
        if (res.data) setCategories(res.data);
      }).catch(console.error);

      brandService.getBrands().then((res) => {
        if (res.data) setBrands(res.data);
      }).catch(console.error);
    }
  }, [isOpen]);

  // Populate edit fields
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || "");
      setSku(productToEdit.sku || "");
      setBarcode(productToEdit.barcode || "");
      setCategory(
        typeof productToEdit.category === "object" && productToEdit.category?._id
          ? productToEdit.category._id
          : typeof productToEdit.category === "string"
          ? productToEdit.category
          : ""
      );
      setBrand(
        typeof productToEdit.brand === "object" && productToEdit.brand?._id
          ? productToEdit.brand._id
          : typeof productToEdit.brand === "string"
          ? productToEdit.brand
          : ""
      );
      setCostPrice(productToEdit.costPrice || 0);
      setPrice(productToEdit.price || 0);
      setDiscount(productToEdit.discount || 0);
      setStock(productToEdit.stock || 0);
      setLowStockThreshold(productToEdit.lowStockThreshold || 5);
      setUnit(productToEdit.unit || "pcs");
      setDescription(productToEdit.description || "");
      setImageUrl(productToEdit.imageUrl || (productToEdit.image as any)?.url || "");
      setImagePreview(productToEdit.imageUrl || (productToEdit.image as any)?.url || "");
      setImageFile(null);
      setStatus(productToEdit.status || "active");
      setFeatured(!!productToEdit.featured);
    } else {
      // Reset form
      setName("");
      setSku(`SKU-${Date.now().toString().slice(-6)}`);
      setBarcode(`890${Math.floor(Math.random() * 900000000 + 100000000)}`);
      setCategory("");
      setBrand("");
      setCostPrice(0);
      setPrice(0);
      setDiscount(0);
      setStock(10);
      setLowStockThreshold(5);
      setUnit("pcs");
      setDescription("");
      setImageUrl("");
      setImagePreview("");
      setImageFile(null);
      setStatus("active");
      setFeatured(false);
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  // Real-time calculations
  const numCost = Number(costPrice) || 0;
  const numPrice = Number(price) || 0;
  const numDiscount = Number(discount) || 0;
  const finalPrice = Math.max(0, numPrice - numDiscount);
  const profit = finalPrice - numCost;
  const profitMargin = finalPrice > 0 ? ((profit / finalPrice) * 100).toFixed(1) : "0.0";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const generateRandomSku = () => {
    setSku(`SKU-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`);
  };

  const generateRandomBarcode = () => {
    setBarcode(`890${Math.floor(Math.random() * 900000000 + 100000000)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Product title/name is required");
      return;
    }
    if (Number(price) < 0) {
      toast.error("Price cannot be negative");
      return;
    }

    setIsSubmitting(true);
    try {
      let payload: any;
      if (imageFile) {
        payload = new FormData();
        payload.append("name", name.trim());
        payload.append("sku", sku.trim());
        if (barcode.trim()) payload.append("barcode", barcode.trim());
        if (category) payload.append("category", category);
        if (brand) payload.append("brand", brand);
        payload.append("costPrice", String(costPrice));
        payload.append("price", String(price));
        payload.append("discount", String(discount));
        payload.append("stock", String(stock));
        payload.append("lowStockThreshold", String(lowStockThreshold));
        payload.append("unit", unit);
        payload.append("description", description.trim());
        payload.append("status", status);
        payload.append("featured", String(featured));
        payload.append("image", imageFile);
      } else {
        payload = {
          name: name.trim(),
          sku: sku.trim(),
          barcode: barcode.trim() || undefined,
          category: category || null,
          brand: brand || null,
          costPrice: Number(costPrice) || 0,
          price: Number(price) || 0,
          discount: Number(discount) || 0,
          stock: Number(stock) || 0,
          lowStockThreshold: Number(lowStockThreshold) || 5,
          unit: unit || "pcs",
          description: description.trim(),
          imageUrl: imageUrl.trim() || undefined,
          status,
          featured
        };
      }

      let res;
      if (productToEdit) {
        res = await productService.updateProduct(productToEdit._id, payload);
        toast.success(`Product '${name}' updated successfully!`);
      } else {
        res = await productService.createProduct(payload);
        toast.success(`Product '${name}' added to store inventory!`);
      }

      if (res.data) {
        onSuccess(res.data);
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {productToEdit ? "Edit Product" : "Add New Store Product"}
              </h2>
              <p className="text-xs text-slate-400">
                {productToEdit
                  ? `Update details and inventory for SKU: ${productToEdit.sku}`
                  : "Fill in product specifications, pricing, and initial stock."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* General Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Product Name / Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Coca-Cola 500ml / Basmati Rice 5kg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Category (Optional)</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Brand / Manufacturer
                </label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Brand (Optional)</option>
                  {brands.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    SKU (Stock Keeping Unit)
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomSku}
                    className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Auto
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="PRD-001"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Barcode (EAN-13 / UPC)
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomBarcode}
                    className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Barcode className="w-3 h-3" /> Auto
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="8901234567890"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Profit Calculator */}
          <div className="space-y-4 pt-3 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> Pricing & Profit Calculation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Cost / Purchase Price ({settings.currency})
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-400">Supplier cost</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Selling Price ({settings.currency}) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-400">Retail price</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Discount Amount ({settings.currency})
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-400">Promo cut per item</span>
              </div>
            </div>

            {/* Profit preview banner */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-slate-300">
                  Estimated Profit per unit:{" "}
                  <strong className={profit >= 0 ? "text-emerald-400" : "text-rose-400"}>
                    {formatPrice(profit)}
                  </strong>
                </span>
              </div>
              <div className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Gross Margin: {profitMargin}%
              </div>
            </div>
          </div>

          {/* Inventory & Stock */}
          <div className="space-y-4 pt-3 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5" /> Inventory & Stock Controls
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Current Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Low Stock Alert Threshold
                </label>
                <input
                  type="number"
                  min="1"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Unit of Measurement
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="gm">Grams (gm)</option>
                  <option value="litre">Litres (ltr)</option>
                  <option value="ml">Millilitres (ml)</option>
                  <option value="bottle">Bottle</option>
                  <option value="pack">Pack / Packet</option>
                  <option value="box">Box / Carton</option>
                  <option value="dozen">Dozen</option>
                </select>
              </div>
            </div>
          </div>

          {/* Media & Details */}
          <div className="space-y-4 pt-3 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" /> Product Image & Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Upload Image File or Provide URL
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                  />
                  <input
                    type="url"
                    placeholder="Or enter Image URL (https://...)"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImagePreview(e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Preview Thumbnail */}
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => setImagePreview("")}
                    />
                  ) : (
                    <Package className="w-8 h-8 text-slate-600" />
                  )}
                </div>
                <div className="text-xs text-slate-400">
                  <p className="font-medium text-slate-200">Image Preview</p>
                  <p>Recommended: 500x500px square photo (PNG, JPG, WebP)</p>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Optional details, ingredients, expiry instructions, or shop notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="active">Active (Available for Sale)</option>
                  <option value="inactive">Inactive (Hidden)</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-800 border-slate-700"
                  />
                  <span className="text-xs font-semibold text-slate-300">
                    Feature on POS Quick Tiles
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Product...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{productToEdit ? "Update Product" : "Add to Store"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
