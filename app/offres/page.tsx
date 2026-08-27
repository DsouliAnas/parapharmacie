import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

interface ProductBrand {
  _id: string;
  name: string;
  logo?: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images: string[];
  stock: number;
  salesCount?: number;
  brand?: ProductBrand;
}

async function getProducts(): Promise<Product[]> {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  try {
    const response = await fetch(`${baseUrl}/api/products`, {
      cache: "no-store",
    });
    if (!response.ok) return [];
    const data: unknown = await response.json();
    return Array.isArray(data) ? (data as Product[]) : [];
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    return [];
  }
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

export default async function OffersPage() {
  const products = await getProducts();

  const promotionalProducts = products
    .filter(
      (product) =>
        typeof product.discountPrice === "number" &&
        product.discountPrice > 0 &&
        product.discountPrice < product.price
    )
    .sort((a, b) => getDiscountPercentage(b) - getDiscountPercentage(a));

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      {/* Header */}
      <section className="border-b border-[var(--line)] bg-[var(--forest)] px-6 py-16 md:px-16">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--paper)]/60 transition hover:text-[var(--paper)]"
          >
            <ArrowLeft size={14} />
            Retour à l&apos;accueil
          </Link>

          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--gold)]">
                N°01 — Promotions
              </p>
              <h1 className="font-display mt-3 text-4xl font-medium text-[var(--paper)] md:text-6xl">
                Toutes les offres
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--paper)]/65">
                Une sélection exclusive de produits santé, beauté et bien-être
                actuellement en promotion. Profitez des meilleurs prix.
              </p>
            </div>

            <div className="text-right">
              <p className="font-display text-3xl italic text-[var(--gold)]">
                {promotionalProducts.length}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[var(--paper)]/50">
                offres actives
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products grid */}
      <section className="px-6 py-16 md:px-16">
        <div className="mx-auto max-w-6xl">
          {promotionalProducts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {promotionalProducts.map((product) => (
                <div key={product._id} className="group relative">
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
          ) : (
            <div className="border border-dashed border-[var(--line)] py-24 text-center">
              <p className="text-sm text-[var(--ink)]/50">
                Aucune promotion en cours pour le moment.
              </p>
              <Link
                href="/shop"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--forest)]"
              >
                Voir toute la boutique
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}