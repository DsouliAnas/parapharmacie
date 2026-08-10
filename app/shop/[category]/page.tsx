import Link from "next/link";
import { notFound } from "next/navigation";

interface Subcategory {
  _id: string;
  name: string;
  slug: string;
}

interface Category {
  _id: string;
  name: string;
  image?: string;
}

async function getCategory(
  categorySlug: string
): Promise<Category | null> {
  const response = await fetch(
    `http://localhost:3000/api/categories`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return null;
  }

  const categories = await response.json();

  const category = categories.find(
    (item: Category & { slug?: string }) =>
      item.name
        .toLowerCase()
        .replace(/\s+/g, "-") === categorySlug
  );

  return category || null;
}

async function getSubcategories(
  categoryId: string
): Promise<Subcategory[]> {
  const response = await fetch(
    `http://localhost:3000/api/subcategories?category=${categoryId}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return [];
  }

  const data = await response.json();

  return Array.isArray(data) ? data : [];
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{
    category: string;
  }>;
}) {
  const { category: categorySlug } = await params;

  const category = await getCategory(categorySlug);

  if (!category) {
    notFound();
  }

  const subcategories = await getSubcategories(
    category._id
  );

  return (
    <main className="min-h-screen bg-[#faf9f7] px-6 py-12">
      <div className="mx-auto max-w-6xl">

        <h1 className="text-4xl font-bold text-[#7C8B73]">
          {category.name}
        </h1>

        <p className="mt-2 text-gray-500">
          Découvrez nos produits {category.name.toLowerCase()}.
        </p>

        {subcategories.length === 0 ? (
          <p className="mt-10 text-gray-500">
            Aucune sous-catégorie disponible.
          </p>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

            {subcategories.map((subcategory) => (
              <Link
                key={subcategory._id}
                href={`/shop/${categorySlug}/${subcategory.slug}`}
                className="
                  rounded-2xl
                  bg-white
                  p-6
                  shadow-sm
                  transition
                  hover:-translate-y-1
                  hover:shadow-md
                "
              >
                <h2 className="text-lg font-semibold">
                  {subcategory.name}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Voir les produits
                </p>
              </Link>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}