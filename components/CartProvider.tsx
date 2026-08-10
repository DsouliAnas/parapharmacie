"use client";

import { createContext, useContext, useSyncExternalStore, useState, ReactNode } from "react";

interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  message: string;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/* ------------------------------------------------------------------ */
/* External store: the cart lives outside React, backed by            */
/* localStorage. React just subscribes to it via useSyncExternalStore. */
/* This avoids ever calling setState inside a useEffect.               */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "fairys-cart";

// Must be a stable reference for the server snapshot — returning a
// new [] on every call makes React think the snapshot changed on
// every render, which triggers an infinite-loop warning.
const EMPTY_CART: CartItem[] = [];

let cart: CartItem[] = EMPTY_CART;
let initialized = false;
const listeners = new Set<() => void>();

function ensureInitialized() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    cart = JSON.parse(saved);
  } catch {
    // ignore corrupted localStorage data
  }
}

function getSnapshot() {
  ensureInitialized();
  return cart;
}

function getServerSnapshot(): CartItem[] {
  return EMPTY_CART;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function setCart(updater: CartItem[] | ((current: CartItem[]) => CartItem[])) {
  cart = typeof updater === "function" ? updater(cart) : updater;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  listeners.forEach((listener) => listener());
}

/* ------------------------------------------------------------------ */

export default function CartProvider({ children }: { children: ReactNode }) {
  const cart = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [message, setMessage] = useState("");

  function addToCart(item: CartItem) {
    setCart((current) => {
      const existing = current.find((product) => product._id === item._id);

      if (existing) {
        return current.map((product) =>
          product._id === item._id
            ? { ...product, quantity: product.quantity + 1 }
            : product
        );
      }

      return [...current, { ...item, quantity: item.quantity || 1 }];
    });

    setMessage(`${item.name} ajouté au panier ✅`);

    setTimeout(() => {
      setMessage("");
    }, 2500);
  }

  function removeFromCart(id: string) {
    setCart((current) => current.filter((item) => item._id !== id));
  }

  function increaseQuantity(id: string) {
    setCart((current) =>
      current.map((item) =>
        item._id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }

  function decreaseQuantity(id: string) {
    setCart((current) =>
      current.map((item) =>
        item._id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  }

  function clearCart() {
    setCart([]);
  }

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        message,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}