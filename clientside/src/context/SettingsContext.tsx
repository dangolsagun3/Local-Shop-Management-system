"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface ShopSettings {
  shopName: string;
  currency: string;
  taxPercent: number;
  shopPhone: string;
  shopEmail: string;
  shopAddress: string;
  vatNumber: string;
  receiptFooter: string;
}

const defaultSettings: ShopSettings = {
  shopName: process.env.NEXT_PUBLIC_SHOP_NAME || "ShopX Local Supermarket",
  currency: process.env.NEXT_PUBLIC_SHOP_CURRENCY || "Rs.",
  taxPercent: Number(process.env.NEXT_PUBLIC_SHOP_TAX_PERCENT || 13),
  shopPhone: "+977 9749357835",
  shopEmail: "shopX@gmail.com",
  shopAddress: "Tokha-2, Kathmandu",
  vatNumber: "PAN/VAT: 153766509",
  receiptFooter: "Thank you for shopping with us! Please come again."
};

interface SettingsContextType {
  settings: ShopSettings;
  updateSettings: (newSettings: Partial<ShopSettings>) => void;
  formatPrice: (amount: number) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ShopSettings>(defaultSettings);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("shopx_settings");
      if (saved) {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
  }, []);

  const updateSettings = (newSettings: Partial<ShopSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem("shopx_settings", JSON.stringify(updated));
      return updated;
    });
  };

  const formatPrice = (amount: number): string => {
    const validAmount = isNaN(amount) ? 0 : amount;
    return `${settings.currency} ${validAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, formatPrice }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
