"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  Bell,
  Search,
  PlusCircle,
  ShoppingCart,
  Database,
  RefreshCw,
  Sparkles,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { authService } from "../services/authService";
import toast from "react-hot-toast";

interface NavbarProps {
  onOpenMobileSidebar?: () => void;
  onOpenNewProductModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileSidebar,
  onOpenNewProductModal
}) => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isSeeding, setIsSeeding] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await authService.seedData();
      toast.success("Database sample store data verified/seeded successfully!");
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to seed data");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">MongoDB Atlas Live</span>
            <span className="sm:hidden">DB Online</span>
          </div>
          <span className="text-xs text-slate-400 hidden md:inline-block">
            • {currentTime}
          </span>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Seed Sample Products button */}
        <button
          onClick={handleSeed}
          disabled={isSeeding}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          title="Verify or seed store products and categories"
        >
          <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${isSeeding ? "animate-spin" : ""}`} />
          <span>{isSeeding ? "Syncing..." : "Sync Sample Store"}</span>
        </button>

        {/* Add Product Shortcut button */}
        {onOpenNewProductModal && (
          <button
            onClick={onOpenNewProductModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Add Product</span>
          </button>
        )}

        {/* Quick POS Terminal button */}
        <Link
          href="/pos"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 transition"
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="hidden sm:inline">POS Checkout</span>
        </Link>

        {/* User Pill */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-medium text-white truncate max-w-[100px]">
                {user.name}
              </span>
              <span className="text-[10px] text-slate-400 capitalize">{user.role}</span>
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};
