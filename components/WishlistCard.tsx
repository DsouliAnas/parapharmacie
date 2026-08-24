"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";

interface WishlistProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  stock?: number;
}

interface WishlistItem {
  _id: string;
  product: WishlistProduct;
}

interface WishlistCardProps {
  readonly item: WishlistItem;
}

export default function WishlistCard({
  item,
}: WishlistCardProps) {
  const { addToCart } = useCart();

  const [removed, setRemoved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const [error, setError] = useState("");

  const productImage =
    item.product.images?.[0] ?? "";

  const isInStock =
    item.product.stock === undefined ||
    item.product.stock > 0;

  async function handleRemove(): Promise<void> {
    if (loading || removed) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/wishlist/${encodeURIComponent(item._id)}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          setError(
            "Votre session a expiré. Veuillez vous reconnecter."
          );
        } else if (response.status === 403) {
          setError(
            "Vous n'avez pas accès à cet élément."
          );
        } else if (response.status === 404) {
          setRemoved(true);
        } else {
          setError(
            "Impossible de supprimer ce produit."
          );
        }

        return;
      }

      setRemoved(true);
    } catch (error) {
      console.error(
        "WISHLIST REMOVE ERROR:",
        error
      );

      setError(
        "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleAddToCart(): void {
    if (!isInStock) {
      return;
    }

    addToCart({
      _id: item.product._id,
      name: item.product.name,
      price: item.product.price,
      image: productImage,
      quantity: 1,
    });

    setCartAdded(true);

    window.setTimeout(() => {
      setCartAdded(false);
    }, 2000);
  }

  if (removed) {
    return null;
  }

  return (
    <article className="overflow-hidden rounded-xl bg-white p-5 shadow-sm">
      <Link
        href={`/products/${encodeURIComponent(
          item.product._id
        )}`}
        className="group block"
      >
        {productImage ? (
          <div className="overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={productImage}
              alt={item.product.name}
              className="h-40 w-full object-cover transition duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-400">
            Pas dimage
          </div>
        )}

        <h3 className="mt-3 font-bold transition group-hover:text-[#7C8B73]">
          {item.product.name}
        </h3>
      </Link>

      <p className="mt-2 font-semibold text-gray-900">
        {item.product.price} TND
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!isInStock}
          onClick={handleAddToCart}
          className="rounded-full bg-[#7C8B73] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#66745F] disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isInStock
            ? "Ajouter au panier"
            : "Rupture de stock"}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => {
            void handleRemove();
          }}
          className="rounded-full px-4 py-2 text-sm text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Suppression..."
            : "Supprimer"}
        </button>
      </div>

      {cartAdded && (
        <p className="mt-3 text-sm font-medium text-green-600">
          Produit ajouté au panier ✓
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 text-sm text-red-500"
        >
          {error}
        </p>
      )}
    </article>
  );
}