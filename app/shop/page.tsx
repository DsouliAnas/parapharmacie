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

  const baseUrl =
    process.env.NEXTAUTH_URL || "http://localhost:3000";

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

  return Array.isArray(products)
    ? (products as Product[])
    : [];
}

async function getCategories(): Promise<Category[]> {
  const baseUrl =
    process.env.NEXTAUTH_URL || "http://localhost:3000";

  const response = await fetch(
    `${baseUrl}/api/categories`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return [];
  }

  const categories: unknown =
    await response.json();

  return Array.isArray(categories)
    ? (categories as Category[])
    : [];
}

async function getBrands(): Promise<Brand[]> {
  const baseUrl =
    process.env.NEXTAUTH_URL || "http://localhost:3000";

  const response = await fetch(
    `${baseUrl}/api/brands`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return [];
  }

  const brands: unknown =
    await response.json();

  return Array.isArray(brands)
    ? (brands as Brand[])
    : [];
}

export default async function ShopPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;

  const search =
    params.search?.trim() || "";

  const sort =
    params.sort || "newest";

  const category =
    params.category || "";

  const brand =
    params.brand || "";

  const minPrice =
    params.minPrice || "";

  const maxPrice =
    params.maxPrice || "";

  const inStock =
    params.inStock || "";

  const [
    products,
    categories,
    brands,
  ] = await Promise.all([
    getProducts(
      search,
      sort,
      category,
      brand,
      minPrice,
      maxPrice,
      inStock
    ),
    getCategories(),
    getBrands(),
  ]);

  const hasActiveFilters =
    Boolean(
      category ||
        brand ||
        minPrice ||
        maxPrice ||
        inStock
    );

  return (
    <main className="min-h-screen bg-[#F8F3EA] px-4 py-8 sm:px-6 md:px-10 md:py-12">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 sm:mb-10">
          {search ? (
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 sm:text-sm">
                Résultats de recherche
              </p>

              <h1 className="mt-2 break-words text-3xl font-bold text-[#7C8B73] sm:text-4xl">
                &quot;{search}&quot;
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                {products.length}{" "}
                {products.length > 1
                  ? "produits trouvés"
                  : "produit trouvé"}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-[#7C8B73] sm:text-4xl">
                Boutique
              </h1>

              <p className="mt-2 text-sm text-gray-500 sm:text-base">
                Découvrez tous nos produits.
              </p>
            </>
          )}
        </div>

        {/* Shop layout */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">

          {/* Filters */}
          <ShopFilters
            categories={categories}
            brands={brands}
          />

          {/* Products */}
          <div className="min-w-0 flex-1">

            {/* Top bar */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-gray-500">
                  {products.length}{" "}
                  {products.length > 1
                    ? "produits"
                    : "produit"}
                </p>

                {hasActiveFilters && (
                  <span className="rounded-full bg-[#7C8B73]/10 px-3 py-1 text-xs font-medium text-[#7C8B73]">
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
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm sm:p-12">
                <h2 className="text-lg font-semibold text-gray-800 sm:text-xl">
                  Aucun produit trouvé
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  {search
                    ? `Nous n'avons trouvé aucun produit pour "${search}".`
                    : "Aucun produit disponible pour le moment."}
                </p>

                {(search ||
                  category ||
                  brand ||
                  minPrice ||
                  maxPrice ||
                  inStock) && (
                  <Link
                    href="/shop"
                    className="mt-6 inline-flex rounded-full bg-[#7C8B73] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    Voir tous les produits
                  </Link>
                )}
              </div>
            ) : (
              /* Product grid */
              <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 md:gap-6">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="min-w-0"
                  >
                    <ProductCard
                      _id={product._id}
                      name={product.name}
                      price={product.price}
                      discountPrice={
                        product.discountPrice
                      }
                      image={
                        product.images?.[0] || ""
                      }
                      stock={product.stock}
                      brand={
                        product.brand?.name
                      }
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