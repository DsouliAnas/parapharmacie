"use client";

import {
  useEffect,
  useState,
  type MouseEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
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

interface WishlistProduct {
  _id: string;
}

interface WishlistItem {
  _id: string;
  product?: WishlistProduct;
}

function isWishlistItem(
  value: unknown
): value is WishlistItem {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const item = value as Record<string, unknown>;

  if (typeof item._id !== "string") {
    return false;
  }

  if (item.product === undefined) {
    return true;
  }

  if (
    typeof item.product !== "object" ||
    item.product === null
  ) {
    return false;
  }

  const product =
    item.product as Record<string, unknown>;

  return typeof product._id === "string";
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
  const router = useRouter();

  const [isWishlisted, setIsWishlisted] =
    useState(false);
  const [wishlistId, setWishlistId] =
    useState<string | null>(null);
  const [wishlistLoading, setWishlistLoading] =
    useState(false);
  const [cartMessage, setCartMessage] =
    useState(false);

  const isInStock = stock > 0;

const hasDiscount =
  typeof discountPrice === "number" &&
  Number.isFinite(discountPrice) &&
  discountPrice > 0 &&
  discountPrice < price;

  const finalPrice = hasDiscount
    ? discountPrice
    : price;

  useEffect(() => {
    let cancelled = false;

    async function checkWishlist(): Promise<void> {
      if (!session?.user?.id) {
        if (!cancelled) {
          setIsWishlisted(false);
          setWishlistId(null);
        }

        return;
      }

      try {
        const response = await fetch(
          "/api/wishlist",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const data: unknown =
          await response.json();

        if (!Array.isArray(data)) {
          return;
        }

        const wishlistItems =
          data.filter(isWishlistItem);

        const existingItem =
          wishlistItems.find(
            (item) =>
              item.product?._id === _id
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
          console.error(
            "CHECK WISHLIST ERROR:",
            error
          );
        }
      }
    }

    void checkWishlist();

    return () => {
      cancelled = true;
    };
  }, [_id, session?.user?.id]);

  useEffect(() => {
    return () => {
      setCartMessage(false);
    };
  }, []);

  async function handleWishlist(
    event: MouseEvent<HTMLButtonElement>
  ): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    if (!session?.user?.id) {
      router.push("/login");
      return;
    }

    if (wishlistLoading) {
      return;
    }

    setWishlistLoading(true);

    try {
      if (isWishlisted && wishlistId) {
        const response = await fetch(
          `/api/wishlist/${encodeURIComponent(
            wishlistId
          )}`,
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

      const response = await fetch(
        "/api/wishlist",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product: _id,
          }),
        }
      );

      if (!response.ok) {
        return;
      }

      const data: unknown =
        await response.json();

      if (
        typeof data === "object" &&
        data !== null &&
        "_id" in data &&
        typeof data._id === "string"
      ) {
        setIsWishlisted(true);
        setWishlistId(data._id);
      }
    } catch (error) {
      console.error(
        "WISHLIST ERROR:",
        error
      );
    } finally {
      setWishlistLoading(false);
    }
  }

  function handleAddToCart(
    event: MouseEvent<HTMLButtonElement>
  ): void {
    event.preventDefault();
    event.stopPropagation();

    if (!isInStock) {
      return;
    }

    addToCart({
      _id,
      name,
      price: finalPrice,
      image,
      quantity: 1,
    });

    setCartMessage(true);

    window.setTimeout(() => {
      setCartMessage(false);
    }, 2000);
  }

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link
        href={`/products/${encodeURIComponent(_id)}`}
        className="group block focus:outline-none"
      >
        <div className="relative aspect-square overflow-hidden bg-gray-100 sm:aspect-[4/5]">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              Pas d&apos;image
            </div>
          )}

          {hasDiscount && (
            <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
              Promo
            </span>
          )}

          <button
            type="button"
            onClick={handleWishlist}
            disabled={wishlistLoading}
            aria-label={
              isWishlisted
                ? "Retirer de la wishlist"
                : "Ajouter à la wishlist"
            }
            aria-pressed={isWishlisted}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#7C8B73] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Heart
              size={20}
              aria-hidden="true"
              className={
                isWishlisted
                  ? "fill-red-500 text-red-500"
                  : "text-gray-600"
              }
            />
          </button>
        </div>

        <div className="p-4 sm:p-5">
          {brand && (
            <p className="mb-1 truncate text-xs font-medium uppercase tracking-wide text-gray-400">
              {brand}
            </p>
          )}

          <h2 className="line-clamp-2 min-h-[44px] font-semibold text-gray-900 sm:min-h-[48px]">
            {name}
          </h2>

          <div className="mt-3">
            {hasDiscount ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-bold text-[#7C8B73]">
                  {finalPrice} TND
                </span>

                <span className="text-sm text-gray-400 line-through">
                  {price} TND
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-[#7C8B73]">
                {finalPrice} TND
              </span>
            )}
          </div>

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

      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <button
          type="button"
          disabled={!isInStock}
          onClick={handleAddToCart}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#7C8B73] px-5 py-3 font-semibold text-white transition hover:bg-[#66745F] focus:outline-none focus:ring-2 focus:ring-[#7C8B73] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <ShoppingCart
            size={18}
            aria-hidden="true"
          />

          {isInStock
            ? "Ajouter au panier"
            : "Rupture de stock"}
        </button>

        {cartMessage && (
          <p
            role="status"
            aria-live="polite"
            className="mt-2 text-center text-xs font-medium text-green-600"
          >
            Produit ajouté au panier ✓
          </p>
        )}
      </div>
    </article>
  );
}