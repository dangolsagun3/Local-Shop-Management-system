import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { SettingsProvider } from "../context/SettingsContext";
import { CartProvider } from "../context/CartContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShopX - Modern Local Shop Management System",
  description: "Next-gen Local Retail & Supermarket POS, Inventory & Store Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-emerald-500 selection:text-slate-950`}>
        <SettingsProvider>
          <AuthProvider>
            <CartProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#0f172a",
                    color: "#f8fafc",
                    border: "1px solid #1e293b",
                    borderRadius: "0.75rem",
                    fontSize: "0.875rem"
                  },
                  success: {
                    iconTheme: {
                      primary: "#10b981",
                      secondary: "#0f172a",
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: "#f43f5e",
                      secondary: "#0f172a",
                    },
                  }
                }}
              />
            </CartProvider>
          </AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
