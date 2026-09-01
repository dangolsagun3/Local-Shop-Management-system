"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorTheme?: "emerald" | "blue" | "amber" | "rose" | "purple";
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorTheme = "emerald",
  badge
}) => {
  const themeStyles = {
    emerald: {
      bgIcon: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      accent: "from-emerald-500/10 to-transparent",
      textAccent: "text-emerald-400"
    },
    blue: {
      bgIcon: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      accent: "from-sky-500/10 to-transparent",
      textAccent: "text-sky-400"
    },
    amber: {
      bgIcon: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      accent: "from-amber-500/10 to-transparent",
      textAccent: "text-amber-400"
    },
    rose: {
      bgIcon: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      accent: "from-rose-500/10 to-transparent",
      textAccent: "text-rose-400"
    },
    purple: {
      bgIcon: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      accent: "from-purple-500/10 to-transparent",
      textAccent: "text-purple-400"
    }
  };

  const currentTheme = themeStyles[colorTheme];

  return (
    <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all duration-200 hover:border-slate-750 group">
      {/* Subtle top gradient glow */}
      <div
        className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${currentTheme.accent} blur-2xl pointer-events-none`}
      />

      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
          {title}
        </span>
        <div
          className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-110 ${currentTheme.bgIcon}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-2 flex-wrap">
          <h3 className="text-2xl font-extrabold text-white tracking-tight">{value}</h3>
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {badge}
            </span>
          )}
        </div>

        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-2 text-xs">
            {trend && (
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  trend.isPositive ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {trend.isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {trend.value}
              </span>
            )}
            {subtitle && <span className="text-slate-500 truncate">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
