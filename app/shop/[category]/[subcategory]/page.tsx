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

async function getSubcategory(
  slug: string
): Promise<Subcategory | null> {
  const response = await fetch(
    "http://localhost:3000/api/subcategories",
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return null;
  }

  const subcategories = await response.json();

  const subcategory = subcategories.find(
    (item: Subcategory) => item.slug === slug
  );

  return subcategory || null;
}

async function getProducts(
  subcategoryId: string,
  sort: string
): Promise<Product[]> {
  const response = await fetch(
    `http://localhost:3000/api/products?subcategory=${subcategoryId}&sort=${sort}`,
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

export default async function SubcategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{
    category: string;
    subcategory: string;
  }>;
  searchParams: Promise<{
    sort?: string;
  }>;
}) {
  const {
  category: categorySlug,
  subcategory: subcategorySlug,
} = await params;

const { sort = "newest" } = await searchParams;

  const subcategory =
    await getSubcategory(subcategorySlug);

  if (!subcategory) {
    notFound();
  }

const products =
  await getProducts(subcategory._id, sort);

  return (
    <main className="min-h-screen bg-[#faf9f7]">
      <div className="mx-auto max-w-7xl px-6 py-12">

        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-gray-500">
          <Link
            href="/"
            className="hover:text-pink-500"
          >
            Accueil
          </Link>

          <span className="mx-2">/</span>

          <Link
            href={`/shop/${categorySlug}`}
            className="hover:text-pink-500"
          >
            {subcategory.category.name}
          </Link>

          <span className="mx-2">/</span>

          <span className="text-gray-800">
            {subcategory.name}
          </span>
        </div>

        {/* Title */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#7C8B73]">
            {subcategory.name}
          </h1>

          <p className="mt-2 text-gray-500">
            Découvrez nos produits{" "}
            {subcategory.name.toLowerCase()}.
          </p>
        </div>


        <div className="mb-6 flex justify-end">
             <ProductSort />
        </div>

        {/* Products */}
        {products.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-gray-500">
              Aucun produit disponible dans cette catégorie.
            </p>
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
                      Pas dimage
                    </div>
                  )}

                </div>

                {/* Information */}
                <div className="p-5">

                  <h2 className="font-semibold text-gray-900">
                    {product.name}
                  </h2>

                  <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                    {product.description}
                  </p>

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