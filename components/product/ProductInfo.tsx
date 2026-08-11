"use client";

import { useCart } from "@/components/CartProvider";
import AddToWishlistButton from "./AddToWishlistButton";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  stock: number;
  brand?: {
    name: string;
  };
  category?: {
    name: string;
  };
}

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({
  product,
}: ProductInfoProps) {
  const { addToCart } = useCart();

  const finalPrice =
    product.discountPrice ?? product.price;

  const hasDiscount =
    typeof product.discountPrice === "number" &&
    product.discountPrice < product.price;

  function handleAddToCart() {
    if (product.stock <= 0) {
      return;
    }

    addToCart({
      _id: product._id,
      name: product.name,
      price: finalPrice,
      image: product.images?.[0] || "",
      quantity: 1,
    });
  }

  return (
    <div className="flex flex-col">
      {/* Brand / Category */}
      <div className="flex flex-wrap items-center gap-2">
        {product.brand && (
          <span className="rounded-full bg-[#7C8B73]/10 px-3 py-1 text-xs font-semibold text-[#66745F]">
            {product.brand.name}
          </span>
        )}

        {product.category && (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            {product.category.name}
          </span>
        )}
      </div>

      {/* Name */}
      <h1 className="mt-5 text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
        {product.name}
      </h1>

      {/* Price */}
      <div className="mt-6 flex items-center gap-3">
        <span className="text-3xl font-bold text-[#7C8B73]">
          {finalPrice} TND
        </span>

        {hasDiscount && (
          <span className="text-lg text-gray-400 line-through">
            {product.price} TND
          </span>
        )}

        {hasDiscount && (
          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-500">
            Promotion
          </span>
        )}
      </div>

      {/* Stock */}
      <div className="mt-5">
        {product.stock > 0 ? (
          <div className="flex items-center gap-2 text-sm font-medium text-green-600">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            En stock
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm font-medium text-red-500">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            Rupture de stock
          </div>
        )}
      </div>

      {/* Description */}
      <div className="mt-8 border-t border-gray-200 pt-8">
        <h2 className="text-lg font-semibold text-gray-900">
          Description
        </h2>

        <p className="mt-3 whitespace-pre-line leading-7 text-gray-600">
          {product.description}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={product.stock <= 0}
          onClick={handleAddToCart}
          className="flex-1 rounded-full bg-[#7C8B73] px-8 py-4 font-semibold text-white transition hover:bg-[#66745F] disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {product.stock > 0
            ? "Ajouter au panier"
            : "Rupture de stock"}
        </button>

        <AddToWishlistButton
          productId={product._id}
        />
      </div>

      {/* Small information */}
      <div className="mt-8 grid grid-cols-2 gap-4 border-t border-gray-200 pt-8">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">
            Livraison
          </p>

          <p className="mt-1 text-sm font-medium text-gray-700">
            Livraison disponible
          </p>
        </div>

        <div>
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