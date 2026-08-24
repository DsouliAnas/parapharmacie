"use client";

import {
  createContext,
  type ReactNode,
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

const CartContext =
  createContext<CartContextType | undefined>(
    undefined
  );

const STORAGE_KEY = "fairys-cart";

const EMPTY_CART: CartItem[] = [];

let cart: CartItem[] = EMPTY_CART;
let initialized = false;

const listeners = new Set<() => void>();

function isValidCartItem(
  value: unknown
): value is CartItem {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const item =
    value as Record<string, unknown>;

  return (
    typeof item._id === "string" &&
    item._id.trim().length > 0 &&
    typeof item.name === "string" &&
    item.name.trim().length > 0 &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    item.price >= 0 &&
    typeof item.image === "string" &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity >= 1
  );
}

function sanitizeCart(
  items: unknown[]
): CartItem[] {
  const validItems =
    items.filter(isValidCartItem);

  const uniqueItems = new Map<
    string,
    CartItem
  >();

  for (const item of validItems) {
    const existing =
      uniqueItems.get(item._id);

    if (existing) {
      uniqueItems.set(item._id, {
        ...existing,
        quantity:
          existing.quantity +
          item.quantity,
      });
    } else {
      uniqueItems.set(item._id, {
        ...item,
        quantity: Math.min(
          item.quantity,
          99
        ),
      });
    }
  }

  return Array.from(
    uniqueItems.values()
  );
}

function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") {
    return EMPTY_CART;
  }

  try {
    const saved =
      window.localStorage.getItem(
        STORAGE_KEY
      );

    if (!saved) {
      return EMPTY_CART;
    }

    const parsed: unknown =
      JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      window.localStorage.removeItem(
        STORAGE_KEY
      );

      return EMPTY_CART;
    }

    return sanitizeCart(parsed);
  } catch {
    window.localStorage.removeItem(
      STORAGE_KEY
    );

    return EMPTY_CART;
  }
}

function ensureInitialized(): void {
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

function subscribe(
  callback: () => void
): () => void {
  listeners.add(callback);

  return () => {
    listeners.delete(callback);
  };
}

function updateCart(
  updater:
    | CartItem[]
    | ((current: CartItem[]) => CartItem[])
): void {
  const nextCart =
    typeof updater === "function"
      ? updater(cart)
      : updater;

  cart = sanitizeCart(nextCart);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(cart)
      );
    } catch (error) {
      console.error(
        "CART STORAGE ERROR:",
        error
      );
    }
  }

  listeners.forEach(
    (listener) => listener()
  );
}

export default function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const currentCart =
    useSyncExternalStore(
      subscribe,
      getSnapshot,
      getServerSnapshot
    );

  const [message, setMessage] =
    useState("");

  function showMessage(
    text: string
  ): void {
    setMessage(text);

    window.setTimeout(() => {
      setMessage("");
    }, 2500);
  }

  function addToCart(
    item: CartItem
  ): void {
    if (
      !isValidCartItem(item)
    ) {
      return;
    }

    updateCart((current) => {
      const existing =
        current.find(
          (product) =>
            product._id === item._id
        );

      if (existing) {
        return current.map(
          (product) =>
            product._id === item._id
              ? {
                  ...product,
                  quantity:
                    Math.min(
                      product.quantity +
                        1,
                      99
                    ),
                }
              : product
        );
      }

      return [
        ...current,
        {
          ...item,
          quantity: Math.min(
            Math.max(
              1,
              Math.floor(item.quantity)
            ),
            99
          ),
        },
      ];
    });

    showMessage(
      `${item.name} ajouté au panier ✅`
    );
  }

  function removeFromCart(
    id: string
  ): void {
    if (!id.trim()) {
      return;
    }

    updateCart((current) =>
      current.filter(
        (item) => item._id !== id
      )
    );
  }

  function increaseQuantity(
    id: string
  ): void {
    if (!id.trim()) {
      return;
    }

    updateCart((current) =>
      current.map((item) =>
        item._id === id
          ? {
              ...item,
              quantity:
                Math.min(
                  item.quantity + 1,
                  99
                ),
            }
          : item
      )
    );
  }

  function decreaseQuantity(
    id: string
  ): void {
    if (!id.trim()) {
      return;
    }

    updateCart((current) =>
      current.flatMap((item) => {
        if (item._id !== id) {
          return [item];
        }

        if (item.quantity > 1) {
          return [
            {
              ...item,
              quantity:
                item.quantity - 1,
            },
          ];
        }

        return [];
      })
    );
  }

  function clearCart(): void {
    updateCart([]);
  }

  const cartCount =
    currentCart.reduce(
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

export function useCart(): CartContextType {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}