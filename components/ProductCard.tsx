"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCart } from "@/components/CartProvider";

interface ProductCardProps {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  stock: number;
  brand?: string;
}

interface WishlistItem {
  _id: string;
  product?: {
    _id: string;
  };
}

export default function ProductCard({
  _id,
  name,
  price,
  discountPrice,
  image,
  stock,
  brand,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const { data: session } = useSession();

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistId, setWishlistId] = useState<string | null>(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartMessage, setCartMessage] = useState(false);

  const isInStock = stock > 0;
  const hasDiscount =
    discountPrice !== undefined && discountPrice < price;

  /*
   * Check wishlist status.
   *
   * All state updates happen inside the asynchronous
   * operation rather than directly inside the effect body.
   */
  useEffect(() => {
    let cancelled = false;

    async function checkWishlist() {
      if (!session?.user?.id) {
        return;
      }

      try {
        const response = await fetch("/api/wishlist", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const wishlist: unknown = await response.json();

        if (!Array.isArray(wishlist)) {
          return;
        }

        const items = wishlist as WishlistItem[];

        const existingItem = items.find(
          (item) => item.product?._id === _id
        );

        if (cancelled) {
          return;
        }

        if (existingItem) {
          setIsWishlisted(true);
          setWishlistId(existingItem._id);
        } else {
          setIsWishlisted(false);
          setWishlistId(null);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("CHECK WISHLIST ERROR:", error);
        }
      }
    }

    void checkWishlist();

    return () => {
      cancelled = true;
    };
  }, [_id, session?.user?.id]);

  /*
   * Add / remove wishlist.
   */
  async function handleWishlist(
    event: React.MouseEvent<HTMLButtonElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (!session?.user?.id) {
      window.location.href = "/login";
      return;
    }

    if (wishlistLoading) {
      return;
    }

    setWishlistLoading(true);

    try {
      /*
       * Remove from wishlist
       */
      if (isWishlisted && wishlistId) {
        const response = await fetch(
          `/api/wishlist/${wishlistId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          return;
        }

        setIsWishlisted(false);
        setWishlistId(null);

        return;
      }

      /*
       * Add to wishlist
       */
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product: _id,
        }),
      });

      if (!response.ok) {
        return;
      }

      const wishlistItem: unknown = await response.json();

      if (
        typeof wishlistItem === "object" &&
        wishlistItem !== null &&
        "_id" in wishlistItem &&
        typeof wishlistItem._id === "string"
      ) {
        setIsWishlisted(true);
        setWishlistId(wishlistItem._id);
      }
    } catch (error) {
      console.error("WISHLIST ERROR:", error);
    } finally {
      setWishlistLoading(false);
    }
  }

  /*
   * Add product to cart.
   */
  function handleAddToCart(
    event: React.MouseEvent<HTMLButtonElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (!isInStock) {
      return;
    }

    addToCart({
      _id,
      name,
      price: discountPrice ?? price,
      image,
      quantity: 1,
    });

    setCartMessage(true);

    setTimeout(() => {
      setCartMessage(false);
    }, 2000);
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Product link */}
      <Link href={`/products/${_id}`} className="group block">
        {/* Image */}
        <div className="relative h-64 overflow-hidden bg-gray-100">
          {image ? (
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              Pas d&apos;image
            </div>
          )}

          {/* Discount badge */}
          {hasDiscount && (
            <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
              Promo
            </span>
          )}

          {/* Wishlist */}
          <button
            type="button"
            onClick={handleWishlist}
            disabled={wishlistLoading}
            aria-label={
              isWishlisted
                ? "Retirer de la wishlist"
                : "Ajouter à la wishlist"
            }
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Heart
              size={20}
              className={
                isWishlisted
                  ? "fill-red-500 text-red-500"
                  : "text-gray-600"
              }
            />
          </button>
        </div>

        {/* Product information */}
        <div className="p-5">
          {/* Brand */}
          {brand && (
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
              {brand}
            </p>
          )}

          {/* Name */}
          <h2 className="line-clamp-2 min-h-[48px] font-semibold text-gray-900">
            {name}
          </h2>

          {/* Price */}
          <div className="mt-3">
            {hasDiscount ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-[#7C8B73]">
                  {discountPrice} TND
                </span>

                <span className="text-sm text-gray-400 line-through">
                  {price} TND
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-[#7C8B73]">
                {price} TND
              </span>
            )}
          </div>

          {/* Stock */}
          <div className="mt-2">
            {isInStock ? (
              <span className="text-xs text-green-600">
                En stock
              </span>
            ) : (
              <span className="text-xs text-red-500">
                Rupture de stock
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to cart */}
      <div className="px-5 pb-5">
        <button
          type="button"
          disabled={!isInStock}
          onClick={handleAddToCart}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#7C8B73] px-5 py-3 font-semibold text-white transition hover:bg-[#66745F] disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <ShoppingCart size={18} />

          {isInStock
            ? "Ajouter au panier"
            : "Rupture de stock"}
        </button>

        {/* Cart confirmation */}
        {cartMessage && (
          <p className="mt-2 text-center text-xs font-medium text-green-600">
            Produit ajouté au panier ✓
          </p>
        )}
      </div>
    </div>
  );
}