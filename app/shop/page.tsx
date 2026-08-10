import Link from "next/link";
import { notFound } from "next/navigation";

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

interface SearchPageProps {
  searchParams: Promise<{
    search?: string;
    sort?: string;
  }>;
}

async function getProducts(
  search: string,
  sort: string
): Promise<Product[]> {
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  if (sort) {
    params.set("sort", sort);
  }

  const response = await fetch(
    `http://localhost:3000/api/products?${params.toString()}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return [];
  }

  const products = await response.json();

  return Array.isArray(products) ? products : [];
}

export default async function ShopPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;

  const search = params.search?.trim() || "";
  const sort = params.sort || "newest";

  const products = await getProducts(search, sort);

  return (
    <main className="min-h-screen bg-[#f8f7f3]">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10">

        {/* Header */}
        <div className="mb-10">
          {search ? (
            <>
              <p className="text-sm text-gray-500">
                Résultats de recherche
              </p>

              <h1 className="mt-2 text-4xl font-bold text-[#7C8B73]">
                &quot;{search}&quot;
              </h1>

              <p className="mt-2 text-gray-500">
                {products.length}{" "}
                {products.length > 1
                  ? "produits trouvés"
                  : "produit trouvé"}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-[#7C8B73]">
                Boutique
              </h1>

              <p className="mt-2 text-gray-500">
                Découvrez tous nos produits.
              </p>
            </>
          )}
        </div>

        {/* Sort */}
        {products.length > 0 && (
          <div className="mb-8 flex justify-end">
            <form method="GET">
              {search && (
                <input
                  type="hidden"
                  name="search"
                  value={search}
                />
              )}

              <select
                name="sort"
                defaultValue={sort}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-[#7C8B73]"
              >
                <option value="newest">
                  Nouveautés
                </option>

                <option value="price-asc">
                  Prix croissant
                </option>

                <option value="price-desc">
                  Prix décroissant
                </option>

                <option value="name">
                  Nom A-Z
                </option>
              </select>
            </form>
          </div>
        )}

        {/* Products */}
        {products.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800">
              Aucun produit trouvé
            </h2>

            <p className="mt-2 text-gray-500">
              {search
                ? `Nous n'avons trouvé aucun produit pour "${search}".`
                : "Aucun produit disponible pour le moment."}
            </p>

            {search && (
              <Link
                href="/shop"
                className="mt-6 inline-block rounded-full bg-[#7C8B73] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                Voir tous les produits
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

            {products.map((product) => (
              <Link
                key={product._id}
                href={`/products/${product._id}`}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Image */}
                <div className="h-64 overflow-hidden bg-gray-100">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      Pas d&apos;image
                    </div>
                  )}
                </div>

                {/* Product information */}
                <div className="p-5">
                  <h2 className="font-semibold text-gray-900">
                    {product.name}
                  </h2>

                  <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                    {product.description}
                  </p>

                  {/* Price + stock */}
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      {product.discountPrice ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#7C8B73]">
                            {product.discountPrice} TND
                          </span>

                          <span className="text-sm text-gray-400 line-through">
                            {product.price} TND
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold text-[#7C8B73]">
                          {product.price} TND
                        </span>
                      )}
                    </div>

                    {product.stock > 0 ? (
                      <span className="text-xs text-green-600">
                        En stock
                      </span>
                    ) : (
                      <span className="text-xs text-red-500">
                        Rupture
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}

          </div>
        )}
      </div>
    </main>
  );
}