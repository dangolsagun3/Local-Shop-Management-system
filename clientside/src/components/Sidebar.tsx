"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Receipt,
  Tags,
  LogOut,
  Store,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: Array<'admin' | 'seller' | 'customer' | 'cashier' | 'manager'>;
  badge?: string | number;
}

export const Sidebar: React.FC<{ lowStockCount?: number }> = ({ lowStockCount = 0 }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const [collapsed, setCollapsed] = useState(false);

  const navItems: NavItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "POS Terminal", href: "/pos", icon: ShoppingCart },
    {
      name: "Products",
      href: "/products",
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined
    },
    { name: "Inventory", href: "/inventory", icon: Boxes },
    { name: "Sales & Invoices", href: "/sales", icon: Receipt },
    { name: "Categories", href: "/categories", icon: Tags }
  ];

  const filteredNav = navItems.filter((item) => {
    if (!item.roles) return true;
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  return (
    <aside
      className={`relative flex flex-col bg-slate-900 text-slate-200 border-r border-slate-800 transition-all duration-300 z-30 select-none ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header / Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50 flex-shrink-0">
            <Store className="w-6 h-6" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5 truncate">
                Shop<span className="text-emerald-400">X</span>
                <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  POS
                </span>
              </span>
              <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                {settings.shopName}
              </span>
            </div>
          )}
        </Link>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition hidden md:block"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* POS Quick Button */}
      <div className="p-3">
        <Link
          href="/pos"
          className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm transition shadow-md ${
            pathname === "/pos"
              ? "bg-emerald-500 text-slate-950 shadow-emerald-500/20 ring-2 ring-emerald-400/50"
              : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-emerald-900/40"
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {!collapsed && <span>Open POS Terminal</span>}
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="text-[11px] font-semibold tracking-wider text-slate-300 uppercase px-3 py-1 mb-1">
          {!collapsed ? "Store Management" : "•••"}
        </div>
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition group relative ${
                isActive
                  ? "bg-emerald-600/15 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? "text-emerald-400" : "text-slate-300 group-hover:text-slate-200"
                }`}
              />
              {!collapsed && (
                <span className="flex-1 truncate">{item.name}</span>
              )}
              {!collapsed && item.badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  {item.badge}
                </span>
              )}
              {collapsed && item.badge && (
                <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-2 right-2 ring-2 ring-slate-900" />
              )}
            </Link>
          );
        })}
      </div>

      {/* User Info & Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        {user ? (
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-white truncate">{user.name}</span>
                  <span className="text-[10px] capitalize text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    {user.role}
                  </span>
                </div>
              )}
            </div>
            {!collapsed && (
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700/50 transition"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 w-full py-2 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition"
          >
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </aside>
  );
};
