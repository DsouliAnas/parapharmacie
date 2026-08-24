import Link from "next/link";
import { notFound } from "next/navigation";
import ProductSort from "@/components/ProductSort";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  stock: number;
  isActive: boolean;
}

interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  category: {
    _id: string;
    name: string;
  };
}

type SortOption =
  | "newest"
  | "oldest"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc";

interface SubcategoryPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
  }>;
  searchParams: Promise<{
    sort?: string;
  }>;
}

function isSortOption(value: string): value is SortOption {
  return (
    value === "newest" ||
    value === "oldest" ||
    value === "price-asc" ||
    value === "price-desc" ||
    value === "name-asc" ||
    value === "name-desc"
  );
}

async function getSubcategory(
  slug: string
): Promise<Subcategory | null> {
  const baseUrl =
    process.env.NEXTAUTH_URL || "http://localhost:3000";

  try {
    const response = await fetch(
      `${baseUrl}/api/subcategories`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const data: unknown = await response.json();

    if (!Array.isArray(data)) {
      return null;
    }

    const subcategory = data.find(
      (item: unknown): item is Subcategory => {
        if (
          typeof item !== "object" ||
          item === null
        ) {
          return false;
        }

        const candidate =
          item as Partial<Subcategory>;

        return (
          typeof candidate.slug === "string" &&
          candidate.slug === slug &&
          typeof candidate._id === "string" &&
          typeof candidate.name === "string" &&
          typeof candidate.category === "object" &&
          candidate.category !== null &&
          typeof candidate.category._id === "string" &&
          typeof candidate.category.name === "string"
        );
      }
    );

    return subcategory ?? null;
  } catch {
    return null;
  }
}

async function getProducts(
  subcategoryId: string,
  sort: SortOption
): Promise<Product[]> {
  const baseUrl =
    process.env.NEXTAUTH_URL || "http://localhost:3000";

  try {
    const response = await fetch(
      `${baseUrl}/api/products?subcategory=${encodeURIComponent(
        subcategoryId
      )}&sort=${encodeURIComponent(sort)}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return [];
    }

    const data: unknown = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    return data.filter(
      (item: unknown): item is Product => {
        if (
          typeof item !== "object" ||
          item === null
        ) {
          return false;
        }

        const product = item as Partial<Product>;

        return (
          typeof product._id === "string" &&
          typeof product.name === "string" &&
          typeof product.description === "string" &&
          typeof product.price === "number" &&
          typeof product.stock === "number" &&
          typeof product.isActive === "boolean" &&
          Array.isArray(product.images)
        );
      }
    );
  } catch {
    return [];
  }
}

export default async function SubcategoryPage({
  params,
  searchParams,
}: SubcategoryPageProps) {
  const {
    category: categorySlug,
    subcategory: subcategorySlug,
  } = await params;

  const { sort: sortParameter } =
    await searchParams;

  const sort: SortOption =
    sortParameter && isSortOption(sortParameter)
      ? sortParameter
      : "newest";

  const subcategory =
    await getSubcategory(subcategorySlug);

  if (!subcategory) {
    notFound();
  }

  if (subcategory.category._id === "") {
    notFound();
  }

  const products = await getProducts(
    subcategory._id,
    sort
  );

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink)]/45">
          <Link
            href="/"
            className="transition hover:text-[var(--clay)]"
          >
            Accueil
          </Link>

          <span className="text-[var(--ink)]/25">
            /
          </span>

          <Link
            href={`/shop/${categorySlug}`}
            className="transition hover:text-[var(--clay)]"
          >
            {subcategory.category.name}
          </Link>

          <span className="text-[var(--ink)]/25">
            /
          </span>

          <span className="text-[var(--forest)]">
            {subcategory.name}
          </span>
        </div>

        <div className="mb-10 border-b border-[var(--line)] pb-8">
          <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--forest)]">
            <span>Sous-catégorie</span>
            <span className="leader" />
          </div>

          <h1 className="font-display mt-4 text-4xl font-medium text-[var(--forest)] md:text-5xl">
            {subcategory.name}
          </h1>

          <p className="mt-3 text-sm text-[var(--ink)]/55">
            Découvrez nos produits{" "}
            {subcategory.name.toLowerCase()}.
          </p>
        </div>

        <div className="mb-8 flex items-center justify-between border-b border-[var(--line)] pb-4">
          <p className="text-[13px] uppercase tracking-[0.1em] text-[var(--ink)]/50">
            {products.length}{" "}
            {products.length > 1
              ? "produits"
              : "produit"}
          </p>

          <ProductSort />
        </div>

        {products.length === 0 ? (
          <div className="border border-dashed border-[var(--line)] bg-[var(--paper-deep)] p-10 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--clay)]">
              Rayon vide
            </p>

            <p className="mt-3 text-sm text-[var(--ink)]/55">
              Aucun produit disponible dans cette
              catégorie.
            </p>
          </div>
        ) : (
          <div className="grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => {
              const hasDiscount =
                typeof product.discountPrice ===
                  "number" &&
                product.discountPrice > 0 &&
                product.discountPrice <
                  product.price;

              const discountPercentage =
                hasDiscount
                  ? Math.round(
                      ((product.price -
                        product.discountPrice!) /
                        product.price) *
                        100
                    )
                  : 0;

              const isInStock =
                product.stock > 0 &&
                product.isActive;

              return (
                <Link
                  key={product._id}
                  href={`/products/${product._id}`}
                  className="group relative bg-[var(--paper)] transition hover:bg-[var(--paper-deep)]"
                >
                  {hasDiscount && (
                    <div className="absolute left-3 top-3 z-10 bg-[var(--clay)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--paper)]">
                      -{discountPercentage}%
                    </div>
                  )}

                  <div className="h-64 overflow-hidden bg-[var(--paper-deep)]">
                    {product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover grayscale-[10%] transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[11px] uppercase tracking-[0.14em] text-[var(--ink)]/30">
                        Pas d&apos;image
                      </div>
                    )}
                  </div>

                  <div className="border-t border-[var(--line)] p-5">
                    <h2 className="font-display text-lg font-medium text-[var(--forest)]">
                      {product.name}
                    </h2>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--ink)]/55">
                      {product.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-4">
                      <div>
                        {hasDiscount ? (
                          <div className="flex items-baseline gap-2">
                            <span className="font-display italic text-[var(--forest)]">
                              {product.discountPrice!.toFixed(
                                2
                              )}{" "}
                              TND
                            </span>

                            <span className="text-xs text-[var(--ink)]/35 line-through">
                              {product.price.toFixed(2)}{" "}
                              TND
                            </span>
                          </div>
                        ) : (
                          <span className="font-display italic text-[var(--forest)]">
                            {product.price.toFixed(2)}{" "}
                            TND
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em]">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isInStock
                              ? "bg-[var(--forest)]"
                              : "bg-[var(--clay)]"
                          }`}
                        />

                        <span
                          className={
                            isInStock
                              ? "text-[var(--forest)]"
                              : "text-[var(--clay)]"
                          }
                        >
                          {isInStock
                            ? "En stock"
                            : "Rupture"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}