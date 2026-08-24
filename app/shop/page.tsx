import Link from "next/link";
import ShopFilters from "@/components/ShopFilters";
import ProductSort from "@/components/ProductSort";
import ProductCard from "@/components/ProductCard";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  stock: number;
  isActive: boolean;
  category?: {
    _id: string;
    name: string;
  };
  brand?: {
    _id: string;
    name: string;
  };
}

interface Category {
  _id: string;
  name: string;
}

interface Brand {
  _id: string;
  name: string;
}

interface SearchPageProps {
  searchParams: Promise<{
    search?: string;
    sort?: string;
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
  }>;
}

async function getProducts(
  search: string,
  sort: string,
  category: string,
  brand: string,
  minPrice: string,
  maxPrice: string,
  inStock: string
): Promise<Product[]> {
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  if (sort) {
    params.set("sort", sort);
  }

  if (category) {
    params.set("category", category);
  }

  if (brand) {
    params.set("brand", brand);
  }

  if (minPrice) {
    params.set("minPrice", minPrice);
  }

  if (maxPrice) {
    params.set("maxPrice", maxPrice);
  }

  if (inStock) {
    params.set("inStock", inStock);
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const response = await fetch(
    `${baseUrl}/api/products?${params.toString()}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return [];
  }

  const products: unknown = await response.json();

  return Array.isArray(products) ? (products as Product[]) : [];
}

async function getCategories(): Promise<Category[]> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const response = await fetch(`${baseUrl}/api/categories`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const categories: unknown = await response.json();

  return Array.isArray(categories) ? (categories as Category[]) : [];
}

async function getBrands(): Promise<Brand[]> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const response = await fetch(`${baseUrl}/api/brands`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const brands: unknown = await response.json();

  return Array.isArray(brands) ? (brands as Brand[]) : [];
}

export default async function ShopPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  const search = params.search?.trim() || "";
  const sort = params.sort || "newest";
  const category = params.category || "";
  const brand = params.brand || "";
  const minPrice = params.minPrice || "";
  const maxPrice = params.maxPrice || "";
  const inStock = params.inStock || "";

  const [products, categories, brands] = await Promise.all([
    getProducts(search, sort, category, brand, minPrice, maxPrice, inStock),
    getCategories(),
    getBrands(),
  ]);

  const hasActiveFilters = Boolean(
    category || brand || minPrice || maxPrice || inStock
  );

  const resetHref =
    search || category || brand || minPrice || maxPrice || inStock;

  return (
    <main className="min-h-screen bg-[var(--paper)] px-4 py-10 sm:px-6 md:px-10 md:py-14">
      <div className="mx-auto max-w-7xl">
        {/* =====================================================
            EN-TÊTE — fiche numérotée, cohérente avec l'accueil
        ===================================================== */}

        <div className="mb-10 border-b border-[var(--line)] pb-8 sm:mb-12">
          <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--forest)]">
            <span>
              {search ? "N°00 — Résultats de recherche" : "N°00 — Catalogue"}
            </span>
            <span className="leader" />
          </div>

          {search ? (
            <>
              <h1 className="font-display mt-4 break-words text-3xl font-medium italic text-[var(--forest)] sm:text-5xl">
                &quot;{search}&quot;
              </h1>

              <p className="mt-3 text-sm text-[var(--ink)]/55">
                {products.length}{" "}
                {products.length > 1 ? "produits trouvés" : "produit trouvé"}
              </p>
            </>
          ) : (
            <>
              <h1 className="font-display mt-4 text-3xl font-medium text-[var(--forest)] sm:text-5xl">
                Boutique
              </h1>

              <p className="mt-3 text-sm text-[var(--ink)]/55 sm:text-base">
                Découvrez l&apos;ensemble de notre sélection.
              </p>
            </>
          )}
        </div>

        {/* =====================================================
            SHOP LAYOUT
        ===================================================== */}

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          {/* Filters */}
          <ShopFilters categories={categories} brands={brands} />

          {/* Products */}
          <div className="min-w-0 flex-1">
            {/* Top bar */}
            <div className="mb-6 flex flex-col gap-4 border-b border-[var(--line)] pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <p className="text-[13px] uppercase tracking-[0.1em] text-[var(--ink)]/50">
                  {products.length}{" "}
                  {products.length > 1 ? "produits" : "produit"}
                </p>

                {hasActiveFilters && (
                  <span className="border border-[var(--clay)]/40 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--clay)]">
                    Filtres actifs
                  </span>
                )}
              </div>

              {products.length > 0 && (
                <div className="w-full sm:w-auto">
                  <ProductSort />
                </div>
              )}
            </div>

            {/* Empty state */}
            {products.length === 0 ? (
              <div className="border border-dashed border-[var(--line)] bg-[var(--paper-deep)] p-8 text-center sm:p-14">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--clay)]">
                  Rayon vide
                </p>

                <h2 className="font-display mt-3 text-xl font-medium text-[var(--forest)] sm:text-2xl">
                  Aucun produit trouvé
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--ink)]/55">
                  {search
                    ? `Nous n'avons trouvé aucun produit pour "${search}".`
                    : "Aucun produit disponible pour le moment."}
                </p>

                {resetHref && (
                  <Link
                    href="/shop"
                    className="mt-6 inline-flex items-center gap-2 bg-[var(--forest)] px-6 py-3 text-sm font-semibold text-[var(--paper)] transition hover:bg-[var(--forest-soft)]"
                  >
                    Voir tous les produits
                  </Link>
                )}
              </div>
            ) : (
              /* Product grid */
              <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 md:gap-6">
                {products.map((product) => (
                  <div key={product._id} className="min-w-0">
                    <ProductCard
                      _id={product._id}
                      name={product.name}
                      price={product.price}
                      discountPrice={product.discountPrice}
                      image={product.images?.[0] || ""}
                      stock={product.stock}
                      brand={product.brand?.name}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}