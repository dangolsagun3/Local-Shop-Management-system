"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  User,
  KeyRound,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.error("Please enter email/username and password");
      return;
    }

    setIsLoading(true);
    try {
      await login({
        username: username.trim(),
        password
      });
      toast.success("Welcome back to ShopX!");
      
      const savedUserStr = localStorage.getItem("shopx_user");
      const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;
      if (savedUser?.role === "customer") {
        router.push("/pos");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setUsername(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-950/60 mb-3">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Shop<span className="text-emerald-400">X</span> Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Local Shop & Retail Point-of-Sale System
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email or Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="admin@shopx.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Password
              </label>
              <span className="text-[11px] text-slate-500">Min 6 characters</span>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/60 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to ShopX</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Quick Test Accounts:</span>
            <span className="text-[10px] text-emerald-400 font-semibold">Click to autofill</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill("customer@shopx.com", "customer123")}
              className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 hover:bg-emerald-900/50 text-left transition"
            >
              <span className="text-xs font-bold text-emerald-300 block">Customer</span>
              <span className="text-[10px] text-slate-400 block">customer@shopx.com</span>
              <span className="text-[9px] text-emerald-400 font-semibold block mt-0.5">✓ Allowed to Buy</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoFill("admin@shopx.com", "admin123")}
              className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/50 hover:bg-rose-900/50 text-left transition"
            >
              <span className="text-xs font-bold text-rose-300 block">Admin (Staff)</span>
              <span className="text-[10px] text-slate-400 block">admin@shopx.com</span>
              <span className="text-[9px] text-rose-400 font-semibold block mt-0.5">✕ Cannot Buy in POS</span>
            </button>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <span className="text-slate-300 font-semibold">POS Rule:</span> Admin, Cashier, and Manager accounts are staff and cannot buy products in POS terminal. Only customers can make purchases.
          </div>
        </div>

        {/* Footer link to register */}
        <p className="text-center text-xs text-slate-400 mt-4">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-emerald-400 hover:underline"
          >
            Register Store Account
          </Link>
        </p>
      </div>
    </div>
  );
}
