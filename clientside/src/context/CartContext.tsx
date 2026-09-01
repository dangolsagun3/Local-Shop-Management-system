"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, CartItem, CustomerInfo } from "../types";
import { useSettings } from "./SettingsContext";

export interface HeldCart {
  id: string;
  items: CartItem[];
  customer: CustomerInfo;
  note: string;
  savedAt: string;
  total: number;
}

interface CartContextType {
  items: CartItem[];
  customer: CustomerInfo;
  paymentMethod: 'cash' | 'card' | 'online' | 'credit' | 'split';
  paidAmount: number;
  subtotal: number;
  discountTotal: number;
  taxAmount: number;
  total: number;
  changeDue: number;
  heldCarts: HeldCart[];
  addItem: (product: Product, quantity?: number) => boolean;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => boolean;
  updateDiscount: (productId: string, discount: number) => void;
  setCustomer: React.Dispatch<React.SetStateAction<CustomerInfo>>;
  setPaymentMethod: (method: 'cash' | 'card' | 'online' | 'credit' | 'split') => void;
  setPaidAmount: (amount: number) => void;
  clearCart: () => void;
  holdCurrentCart: (note?: string) => boolean;
  recallHeldCart: (id: string) => void;
  deleteHeldCart: (id: string) => void;
}

const defaultCustomer: CustomerInfo = {
  name: "Walk-in Customer",
  phone: "",
  email: "",
  address: ""
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useSettings();
  const [items, setItems] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<CustomerInfo>(defaultCustomer);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'online' | 'credit' | 'split'>('cash');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [heldCarts, setHeldCarts] = useState<HeldCart[]>([]);

  // Restore held carts from storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("shopx_held_carts");
      if (saved) {
        setHeldCarts(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load held carts:", e);
    }
  }, []);

  const saveHeldCarts = (carts: HeldCart[]) => {
    setHeldCarts(carts);
    localStorage.setItem("shopx_held_carts", JSON.stringify(carts));
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountTotal = items.reduce((acc, item) => acc + (item.discount * item.quantity), 0);
  const taxableBase = Math.max(0, subtotal - discountTotal);
  const taxAmount = (taxableBase * settings.taxPercent) / 100;
  const total = Math.max(0, taxableBase + taxAmount);
  const changeDue = Math.max(0, paidAmount - total);

  const addItem = (product: Product, quantity = 1): boolean => {
    if (product.stock <= 0) {
      return false;
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.product._id === product._id);
      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock) {
          return prev; // stock exceeded
        }
        const updated = [...prev];
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          total: (existing.price - existing.discount) * newQty
        };
        return updated;
      } else {
        const itemDiscount = product.discount || 0;
        const newItem: CartItem = {
          product,
          quantity: Math.min(quantity, product.stock),
          price: product.price,
          discount: itemDiscount,
          total: (product.price - itemDiscount) * Math.min(quantity, product.stock)
        };
        return [...prev, newItem];
      }
    });

    return true;
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product._id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number): boolean => {
    if (quantity <= 0) {
      removeItem(productId);
      return true;
    }

    let success = true;
    setItems((prev) =>
      prev.map((item) => {
        if (item.product._id === productId) {
          if (quantity > item.product.stock) {
            success = false;
            return item;
          }
          return {
            ...item,
            quantity,
            total: (item.price - item.discount) * quantity
          };
        }
        return item;
      })
    );

    return success;
  };

  const updateDiscount = (productId: string, discount: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.product._id === productId) {
          const validDiscount = Math.max(0, Math.min(item.price, discount));
          return {
            ...item,
            discount: validDiscount,
            total: (item.price - validDiscount) * item.quantity
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setCustomer(defaultCustomer);
    setPaymentMethod('cash');
    setPaidAmount(0);
  };

  const holdCurrentCart = (note = "Customer Parking Order"): boolean => {
    if (items.length === 0) return false;
    const newHeld: HeldCart = {
      id: `HOLD-${Date.now()}`,
      items: [...items],
      customer: { ...customer },
      note: note || `Order by ${customer.name}`,
      savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      total
    };
    saveHeldCarts([...heldCarts, newHeld]);
    clearCart();
    return true;
  };

  const recallHeldCart = (id: string) => {
    const target = heldCarts.find((c) => c.id === id);
    if (target) {
      setItems(target.items);
      setCustomer(target.customer);
      deleteHeldCart(id);
    }
  };

  const deleteHeldCart = (id: string) => {
    saveHeldCarts(heldCarts.filter((c) => c.id !== id));
  };

  return (
    <CartContext.Provider
      value={{
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
