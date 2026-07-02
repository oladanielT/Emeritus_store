"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { CartContextType, CartItemUI } from "../types";

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemUI[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsed: unknown = JSON.parse(savedCart);
        if (Array.isArray(parsed)) setItems(parsed.filter((item): item is CartItemUI =>
          Boolean(item && typeof item === "object" && "productId" in item && "quantity" in item),
        ));
      } catch (error) {
        console.error("Failed to load cart:", error);
        localStorage.removeItem("cart");
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, mounted]);

  const addItem = (productId: string, quantity: number, variantId?: string) => {
    if (!Number.isFinite(quantity) || quantity <= 0) return;
    void fetch(`/api/products/${encodeURIComponent(productId)}`).then((response) => response.ok ? response.json() : null).then((result) => {
      const product = result?.data;
      if (!product) return;
      setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.productId === productId,
      );
      if (existingItem) {
        return prevItems.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: Math.min(99, item.quantity + quantity),
                price: product?.price ?? item.price,
                name: product?.name ?? item.name,
                image: product?.image ?? item.image,
              }
            : item,
        );
      }

      return [
        ...prevItems,
        {
          productId,
          name: product?.name ?? "Emeritus Item",
          price: product?.price ?? 0,
          quantity: Math.min(99, Math.floor(quantity)),
          image: product?.image ?? "",
          variantId,
        },
      ];
      });
    });
  };

  const removeItem = (productId: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.productId !== productId),
    );
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
    } else {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.productId === productId ? { ...item, quantity: Math.min(99, Math.floor(quantity)) } : item,
        ),
      );
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
