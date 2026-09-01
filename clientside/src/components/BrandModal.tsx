"use client";

import React, { useState, useEffect } from "react";
import { X, Bookmark, CheckCircle2 } from "lucide-react";
import { Brand } from "../types";
import { brandService } from "../services/brandService";
import toast from "react-hot-toast";

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (b: Brand) => void;
  brandToEdit?: Brand | null;
}

export const BrandModal: React.FC<BrandModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  brandToEdit
}) => {
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (brandToEdit) {
      setName(brandToEdit.name || "");
      setSummary(brandToEdit.summary || "");
      setStatus(brandToEdit.status || "active");
    } else {
      setName("");
      setSummary("");
      setStatus("active");
    }
  }, [brandToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Brand name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      let res;
      if (brandToEdit) {
        res = await brandService.updateBrand(brandToEdit.slug, {
          name: name.trim(),
          summary: summary.trim(),
          status
        });
        toast.success("Brand updated successfully!");
      } else {
        res = await brandService.createBrand({
          name: name.trim(),
          summary: summary.trim(),
          status
        });
        toast.success("Brand added successfully!");
      }
      if (res.data) onSuccess(res.data);
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Failed to save brand");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">
              {brandToEdit ? "Edit Brand" : "Add Brand / Supplier"}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Brand / Manufacturer Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Nestlé, Unilever, Coca-Cola, Local Farm..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description / Origin
            </label>
            <textarea
              rows={3}
              placeholder="Brand details or supplier notes..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-md transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Saving..." : "Save Brand"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
