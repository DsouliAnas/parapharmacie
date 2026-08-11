"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useSyncExternalStore,
} from "react";

export interface CartItem {
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

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

const STORAGE_KEY = "fairys-cart";

const EMPTY_CART: CartItem[] = [];

let cart: CartItem[] = EMPTY_CART;
let initialized = false;

const listeners = new Set<() => void>();

function isValidCartItem(value: unknown): value is CartItem {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item._id === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    typeof item.image === "string" &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  );
}

function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") {
    return EMPTY_CART;
  }

  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return EMPTY_CART;
  }

  try {
    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return EMPTY_CART;
    }

    return parsed.filter(isValidCartItem);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return EMPTY_CART;
  }
}

function ensureInitialized() {
  if (
    initialized ||
    typeof window === "undefined"
  ) {
    return;
  }

  initialized = true;
  cart = loadCartFromStorage();
}

function getSnapshot(): CartItem[] {
  ensureInitialized();
  return cart;
}

function getServerSnapshot(): CartItem[] {
  return EMPTY_CART;
}

function subscribe(callback: () => void) {
  listeners.add(callback);

  return () => {
    listeners.delete(callback);
  };
}

function updateCart(
  updater:
    | CartItem[]
    | ((current: CartItem[]) => CartItem[])
) {
  const nextCart =
    typeof updater === "function"
      ? updater(cart)
      : updater;

  cart = nextCart;

  if (typeof window !== "undefined") {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(cart)
    );
  }

  listeners.forEach((listener) => listener());
}

export default function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const currentCart = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const [message, setMessage] = useState("");

  function addToCart(item: CartItem) {
    if (!item._id || item.price < 0) {
      return;
    }

    updateCart((current) => {
      const existing = current.find(
        (product) => product._id === item._id
      );

      if (existing) {
        return current.map((product) =>
          product._id === item._id
            ? {
                ...product,
                quantity:
                  product.quantity + 1,
              }
            : product
        );
      }

      return [
        ...current,
        {
          ...item,
          quantity:
            item.quantity > 0
              ? item.quantity
              : 1,
        },
      ];
    });

    setMessage(
      `${item.name} ajouté au panier ✅`
    );

    window.setTimeout(() => {
      setMessage("");
    }, 2500);
  }

  function removeFromCart(id: string) {
    updateCart((current) =>
      current.filter(
        (item) => item._id !== id
      )
    );
  }

  function increaseQuantity(id: string) {
    updateCart((current) =>
      current.map((item) =>
        item._id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  }

  function decreaseQuantity(id: string) {
    updateCart((current) =>
      current.flatMap((item) => {
        if (item._id !== id) {
          return [item];
        }

        if (item.quantity > 1) {
          return [
            {
              ...item,
              quantity: item.quantity - 1,
            },
          ];
        }

        return [];
      })
    );
  }

  function clearCart() {
    updateCart([]);
  }

  const cartCount = currentCart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart: currentCart,
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
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}