"use client";

import React, { createContext, useContext } from "react";

export interface ShopSettings {
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  vatNumber: string;
  currency: string;
  taxPercent: number;
  receiptFooter: string;
}

interface SettingsContextValue {
  settings: ShopSettings;
  formatPrice: (amount: number) => string;
}

const defaultSettings: ShopSettings = {
  shopName: "ShopX Local Store",
  shopAddress: "Tokha-2",
  shopPhone: "9749357835",
  vatNumber: "153766509",
  currency: "Rs.",
  taxPercent: 13,
  receiptFooter: "Thank you for shopping with us!",
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const settings = defaultSettings;

  const formatPrice = (amount: number) => `${settings.currency} ${amount.toFixed(2)}`;

  return (
    <SettingsContext.Provider value={{ settings, formatPrice }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextValue => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
