"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import AddToWishlistButton from "./AddToWishlistButton";

interface ProductBrand {
  name: string;
}

interface ProductCategory {
  name: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  stock: number;
  brand?: ProductBrand;
  category?: ProductCategory;
}

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({
  product,
}: ProductInfoProps): React.ReactElement {
  const { addToCart } = useCart();

  const [isAddingToCart, setIsAddingToCart] =
    useState<boolean>(false);

  /*
   * Make sure the regular price is valid.
   */
  const regularPrice: number =
    Number.isFinite(product.price) && product.price >= 0
      ? product.price
      : 0;

  /*
   * Only use the discount price when:
   * - it exists
   * - it is a valid number
   * - it is greater than or equal to 0
   * - it is lower than the regular price
   */
const hasDiscount: boolean =
  typeof product.discountPrice === "number" &&
  Number.isFinite(product.discountPrice) &&
  product.discountPrice > 0 &&
  product.discountPrice < regularPrice;

  const finalPrice: number = hasDiscount
    ? product.discountPrice!
    : regularPrice;

  /*
   * Never allow a negative stock value to
   * make the product appear available.
   */
  const stock: number =
    Number.isFinite(product.stock) &&
    product.stock > 0
      ? Math.floor(product.stock)
      : 0;

  const isInStock: boolean = stock > 0;

  /*
   * Format prices consistently.
   */
  const formattedFinalPrice: string =
    finalPrice.toFixed(2);

  const formattedRegularPrice: string =
    regularPrice.toFixed(2);

  /*
   * Add product to cart.
   *
   * The actual stock/security validation must
   * also happen on the server when the order
   * is created. This client-side check is only
   * for the UI.
   */
  function handleAddToCart(): void {
    if (!isInStock || isAddingToCart) {
      return;
    }

    setIsAddingToCart(true);

    addToCart({
      _id: product._id,
      name: product.name,
      price: finalPrice,
      image: product.images?.[0] ?? "",
      quantity: 1,
    });

    /*
     * Prevent rapid double-clicks without
     * leaving the button disabled permanently.
     */
    window.setTimeout(() => {
      setIsAddingToCart(false);
    }, 500);
  }

  return (
    <div className="flex min-w-0 flex-col">
      {/* Brand / Category */}
      {(product.brand || product.category) && (
        <div className="flex flex-wrap items-center gap-2">
          {product.brand && (
            <span className="max-w-full truncate rounded-full bg-[#7C8B73]/10 px-3 py-1 text-xs font-semibold text-[#66745F]">
              {product.brand.name}
            </span>
          )}

          {product.category && (
            <span className="max-w-full truncate rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              {product.category.name}
            </span>
          )}
        </div>
      )}

      {/* Product name */}
      <h1 className="mt-4 break-words text-2xl font-bold leading-tight text-gray-900 sm:text-3xl md:mt-5 md:text-4xl">
        {product.name}
      </h1>

      {/* Price */}
      <div
        className="
          mt-5
          flex
          flex-wrap
          items-center
          gap-x-3
          gap-y-2
        "
      >
        <span
          className="
            text-2xl
            font-bold
            text-[#7C8B73]
            sm:text-3xl
          "
        >
          {formattedFinalPrice} TND
        </span>

        {hasDiscount && (
          <>
            <span
              className="
                text-base
                text-gray-400
                line-through
                sm:text-lg
              "
            >
              {formattedRegularPrice} TND
            </span>

            <span
              className="
                rounded-full
                bg-red-50
                px-3
                py-1
                text-xs
                font-semibold
                text-red-500
              "
            >
              Promotion
            </span>
          </>
        )}
      </div>

      {/* Stock */}
      <div className="mt-5">
        {isInStock ? (
          <div className="flex items-center gap-2 text-sm font-medium text-green-600">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 shrink-0 rounded-full bg-green-500"
            />

            <span>
              En stock
              {stock <= 5 && (
                <span className="ml-1 text-gray-500">
                  — Plus que {stock}
                </span>
              )}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm font-medium text-red-500">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500"
            />

            <span>Rupture de stock</span>
          </div>
        )}
      </div>

      {/* Description */}
      <section className="mt-7 border-t border-gray-200 pt-7 sm:mt-8 sm:pt-8">
        <h2 className="text-lg font-semibold text-gray-900">
          Description
        </h2>

        <p className="mt-3 whitespace-pre-line break-words leading-7 text-gray-600">
          {product.description}
        </p>
      </section>

      {/* Actions */}
      <div
        className="
          mt-7
          flex
          flex-col
          gap-3
          sm:mt-8
          sm:flex-row
        "
      >
        <button
          type="button"
          disabled={!isInStock || isAddingToCart}
          onClick={handleAddToCart}
          aria-disabled={!isInStock || isAddingToCart}
          className="
            min-h-12
            w-full
            rounded-full
            bg-[#7C8B73]
            px-6
            py-3.5
            font-semibold
            text-white
            transition
            hover:bg-[#66745F]
            focus:outline-none
            focus:ring-2
            focus:ring-[#7C8B73]
            focus:ring-offset-2
            active:scale-[0.99]
            disabled:cursor-not-allowed
            disabled:bg-gray-300
            sm:flex-1
            sm:px-8
          "
        >
          {!isInStock
            ? "Rupture de stock"
            : isAddingToCart
              ? "Ajouté au panier ✓"
              : "Ajouter au panier"}
        </button>

        <div className="w-full sm:w-auto">
          <AddToWishlistButton
            productId={product._id}
          />
        </div>
      </div>

      {/* Small information */}
      <div
        className="
          mt-7
          grid
          grid-cols-1
          gap-4
          border-t
          border-gray-200
          pt-7
          sm:mt-8
          sm:grid-cols-2
          sm:pt-8
        "
      >
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-gray-400">
            Livraison
          </p>

          <p className="mt-1 text-sm font-medium text-gray-700">
            Livraison disponible
          </p>
        </div>

        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-gray-400">
            Paiement
          </p>

          <p className="mt-1 text-sm font-medium text-gray-700">
            Paiement à la livraison
          </p>
        </div>
      </div>
    </div>
  );
}