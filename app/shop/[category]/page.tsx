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
  slug?: string;
}

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

function createSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getCategory(
  categorySlug: string
): Promise<Category | null> {
  const baseUrl =
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";

  try {
    const response = await fetch(
      `${baseUrl}/api/categories`,
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

    const category = data.find(
      (item: unknown): item is Category => {
        if (
          typeof item !== "object" ||
          item === null
        ) {
          return false;
        }

        const candidate =
          item as Partial<Category>;

        return (
          typeof candidate._id === "string" &&
          typeof candidate.name === "string" &&
          createSlug(candidate.name) ===
            categorySlug
        );
      }
    );

    return category ?? null;
  } catch {
    return null;
  }
}

async function getSubcategories(
  categoryId: string
): Promise<Subcategory[]> {
  const baseUrl =
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";

  try {
    const response = await fetch(
      `${baseUrl}/api/subcategories?category=${encodeURIComponent(
        categoryId
      )}`,
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
      (item: unknown): item is Subcategory => {
        if (
          typeof item !== "object" ||
          item === null
        ) {
          return false;
        }

        const subcategory =
          item as Partial<Subcategory>;

        return (
          typeof subcategory._id === "string" &&
          typeof subcategory.name === "string" &&
          typeof subcategory.slug === "string"
        );
      }
    );
  } catch {
    return [];
  }
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { category: categorySlug } =
    await params;

  const category =
    await getCategory(categorySlug);

  if (!category) {
    notFound();
  }

  const subcategories =
    await getSubcategories(category._id);

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10">
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
            href="/shop"
            className="transition hover:text-[var(--clay)]"
          >
            Boutique
          </Link>

          <span className="text-[var(--ink)]/25">
            /
          </span>

          <span className="text-[var(--forest)]">
            {category.name}
          </span>
        </div>

        <div className="mb-10 border-b border-[var(--line)] pb-8">
          <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--forest)]">
            <span>Catégorie</span>
            <span className="leader" />
          </div>

          <h1 className="font-display mt-4 text-4xl font-medium text-[var(--forest)] md:text-5xl">
            {category.name}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink)]/55">
            Découvrez nos produits{" "}
            {category.name.toLowerCase()}.
          </p>
        </div>

        {subcategories.length === 0 ? (
          <div className="border border-dashed border-[var(--line)] bg-[var(--paper-deep)] p-10 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--clay)]">
              Catégorie vide
            </p>

            <p className="mt-3 text-sm text-[var(--ink)]/55">
              Aucune sous-catégorie disponible
              pour le moment.
            </p>

            <Link
              href="/shop"
              className="mt-6 inline-flex bg-[var(--forest)] px-6 py-3 text-sm font-semibold text-[var(--paper)] transition hover:bg-[var(--forest-soft)]"
            >
              Voir tous les produits
            </Link>
          </div>
        ) : (
          <div className="grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {subcategories.map((subcategory) => (
              <Link
                key={subcategory._id}
                href={`/shop/${categorySlug}/${subcategory.slug}`}
                className="group bg-[var(--paper)] p-6 transition hover:bg-[var(--paper-deep)]"
              >
                <div className="flex min-h-32 flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--clay)]">
                      Sous-catégorie
                    </p>

                    <h2 className="font-display mt-3 text-xl font-medium text-[var(--forest)]">
                      {subcategory.name}
                    </h2>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-[var(--line)] pt-4">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink)]/50">
                      Voir les produits
                    </span>

                    <span className="text-sm text-[var(--forest)] transition group-hover:translate-x-1">
                      →
                    </span>
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