"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";

interface Product {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images: string[];
  stock: number;
  brand?: { name: string };
}

interface Props {
  products: Product[];
}

function getDiscountPercentage(product: Product): number {
  if (
    typeof product.discountPrice !== "number" ||
    product.discountPrice >= product.price ||
    product.price <= 0
  ) {
    return 0;
  }
  return Math.round(
    ((product.price - product.discountPrice) / product.price) * 100
  );
}

export default function PromotionsCarousel({ products }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = 280;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -cardWidth * 2 : cardWidth * 2,
      behavior: "smooth",
    });
  };

  if (products.length === 0) return null;

  return (
    <div className="relative">
      {/* Navigation arrows */}
      <div className="mb-6 flex items-center justify-end gap-2">
        <button
          onClick={() => scroll("left")}
          className="flex h-10 w-10 items-center justify-center border border-[var(--forest)]/25 text-[var(--forest)] transition hover:bg-[var(--forest)] hover:text-[var(--paper)]"
          aria-label="Précédent"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => scroll("right")}
          className="flex h-10 w-10 items-center justify-center border border-[var(--forest)]/25 text-[var(--forest)] transition hover:bg-[var(--forest)] hover:text-[var(--paper)]"
          aria-label="Suivant"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Sliding track */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scroll-smooth pb-4 scrollbar-hide"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {products.map((product) => (
          <div
            key={product._id}
            className="group relative w-[240px] shrink-0 snap-start sm:w-[260px] lg:w-[280px]"
          >
            <div className="stamp absolute -right-2 -top-2 z-20">
              -{getDiscountPercentage(product)}%
            </div>
            <ProductCard
              _id={product._id}
              name={product.name}
              price={product.price}
              discountPrice={product.discountPrice}
              image={product.images?.[0] ?? ""}
              stock={product.stock}
              brand={product.brand?.name}
            />
          </div>
        ))}
      </div>
    </div>
  );
}