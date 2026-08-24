"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  category: {
    _id: string;
    name: string;
    slug?: string;
  };
}

const staticCategorySlugs = new Set([
  "promo",
  "offers",
]);

function isCategory(value: unknown): value is Category {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item._id === "string" &&
    typeof item.name === "string" &&
    typeof item.slug === "string" &&
    (item.image === undefined ||
      typeof item.image === "string")
  );
}

function isSubcategory(
  value: unknown
): value is Subcategory {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;

  if (
    typeof item._id !== "string" ||
    typeof item.name !== "string" ||
    typeof item.slug !== "string" ||
    typeof item.category !== "object" ||
    item.category === null
  ) {
    return false;
  }

  const category = item.category as Record<
    string,
    unknown
  >;

  return (
    typeof category._id === "string" &&
    typeof category.name === "string" &&
    (category.slug === undefined ||
      typeof category.slug === "string")
  );
}

export default function CategoryMenu(): React.ReactElement {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] =
    useState<string | null>(null);

  const [subcategories, setSubcategories] =
    useState<Record<string, Subcategory[]>>({});

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [loadingCategorySlug, setLoadingCategorySlug] =
    useState<string | null>(null);

  /*
   * LOAD CATEGORIES
   */
  useEffect(() => {
    let cancelled = false;

    async function loadCategories(): Promise<void> {
      try {
        const response = await fetch("/api/categories", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load categories");
        }

        const data: unknown = await response.json();

        if (cancelled) {
          return;
        }

        const validCategories = Array.isArray(data)
          ? data.filter(isCategory)
          : [];

        setCategories(validCategories);
      } catch (error) {
        if (!cancelled) {
          console.error(
            "FAILED TO LOAD CATEGORIES:",
            error
          );

          setCategories([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingCategories(false);
        }
      }
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * LOAD SUBCATEGORIES
   */
  async function loadSubcategories(
    category: Category
  ): Promise<void> {
    /*
     * Promo and Offers don't have
     * subcategories.
     */
    if (staticCategorySlugs.has(category.slug)) {
      return;
    }

    /*
     * Already loaded.
     */
    if (
      Object.prototype.hasOwnProperty.call(
        subcategories,
        category.slug
      )
    ) {
      return;
    }

    setLoadingCategorySlug(category.slug);

    try {
      const response = await fetch(
        `/api/subcategories?category=${encodeURIComponent(
          category._id
        )}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load subcategories"
        );
      }

      const data: unknown = await response.json();

      const validSubcategories = Array.isArray(data)
        ? data.filter(isSubcategory)
        : [];

      setSubcategories((previous) => ({
        ...previous,
        [category.slug]: validSubcategories,
      }));
    } catch (error) {
      console.error(
        "FAILED TO LOAD SUBCATEGORIES:",
        error
      );

      setSubcategories((previous) => ({
        ...previous,
        [category.slug]: [],
      }));
    } finally {
      setLoadingCategorySlug(null);
    }
  }

  /*
   * CATEGORY CLICK
   *
   * This is what makes the menu work on phones.
   */
  function handleCategoryClick(
    category: Category
  ): void {
    /*
     * Promo / Offers don't have a mega menu.
     */
    if (staticCategorySlugs.has(category.slug)) {
      setActiveCategory(null);
      return;
    }

    /*
     * If already open, close it.
     */
    if (activeCategory === category.slug) {
      setActiveCategory(null);
      return;
    }

    /*
     * Open the selected category.
     */
    setActiveCategory(category.slug);

    /*
     * Load its subcategories.
     */
    void loadSubcategories(category);
  }

  /*
   * DESKTOP HOVER
   *
   * Only activates on devices that actually
   * support hover.
   */
  function handleCategoryMouseEnter(
    category: Category
  ): void {
    if (
      !window.matchMedia("(hover: hover)").matches
    ) {
      return;
    }

    if (staticCategorySlugs.has(category.slug)) {
      setActiveCategory(null);
      return;
    }

    setActiveCategory(category.slug);

    void loadSubcategories(category);
  }

  /*
   * DESKTOP ONLY
   *
   * Don't close the menu on mobile.
   */
  function handleMouseLeave(): void {
    if (
      window.matchMedia("(hover: hover)").matches
    ) {
      setActiveCategory(null);
    }
  }

  const activeCategoryData = categories.find(
    (category) =>
      category.slug === activeCategory
  );

  const activeSubcategories =
    activeCategory !== null
      ? subcategories[activeCategory] ?? []
      : [];

  const isStaticCategory =
    activeCategory !== null &&
    staticCategorySlugs.has(activeCategory);

  const isLoadingActiveCategory =
    activeCategory !== null &&
    loadingCategorySlug === activeCategory;

  return (
    <nav
      aria-label="Catégories de produits"
      className="relative border-t border-gray-100 bg-white"
      onMouseLeave={handleMouseLeave}
    >
      {/* =====================================================
          CATEGORY BAR
      ===================================================== */}

      <div className="overflow-x-auto scrollbar-hide">
        <div className="mx-auto flex min-w-max gap-2 px-4 py-3 sm:gap-4 sm:px-6 lg:max-w-7xl lg:gap-6 lg:px-8">
          {loadingCategories ? (
            <div className="px-2 py-2 text-sm text-gray-400">
              Chargement...
            </div>
          ) : categories.length === 0 ? (
            <div className="px-2 py-2 text-sm text-gray-400">
              Aucune catégorie
            </div>
          ) : (
            categories.map((category) => {
              const isActive =
                activeCategory === category.slug;

              return (
                <button
                  key={category._id}
                  type="button"
                  aria-expanded={
                    isActive &&
                    !staticCategorySlugs.has(
                      category.slug
                    )
                  }
                  onClick={() =>
                    handleCategoryClick(category)
                  }
                  onMouseEnter={() =>
                    handleCategoryMouseEnter(category)
                  }
                  className={`relative whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${
                    isActive
                      ? "bg-[#7C8B73]/10 text-[#66745F]"
                      : "text-gray-700 hover:bg-gray-50 hover:text-[#7C8B73]"
                  }`}
                >
                  {category.name}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* =====================================================
          MOBILE MEGA MENU
      ===================================================== */}

      {activeCategory !== null &&
        !isStaticCategory &&
        activeCategoryData && (
          <div
            className="
              relative
              w-full
              border-t
              border-gray-100
              bg-white
              shadow-lg
              lg:absolute
              lg:left-0
              lg:top-full
              lg:z-50
              lg:shadow-xl
            "
          >
            <div
              className="
                mx-auto
                max-h-[65vh]
                overflow-y-auto
                px-4
                py-4
                sm:px-6
                sm:py-6
                lg:max-w-7xl
                lg:px-8
              "
            >
              {/* MOBILE HEADER */}

              <div className="mb-3 flex items-center justify-between lg:hidden">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Catégorie
                  </p>

                  <h3 className="text-base font-semibold text-gray-800">
                    {activeCategoryData.name}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setActiveCategory(null)
                  }
                  aria-label="Fermer le menu"
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    bg-gray-100
                    text-gray-600
                    transition
                    hover:bg-gray-200
                  "
                >
                  ✕
                </button>
              </div>

              {/* CONTENT */}

              {isLoadingActiveCategory ? (
                <div className="py-5 text-sm text-gray-500">
                  Chargement des sous-catégories...
                </div>
              ) : activeSubcategories.length === 0 ? (
                <div className="py-5 text-sm text-gray-500">
                  Aucune sous-catégorie disponible.
                </div>
              ) : (
                <div
                  className="
                    grid
                    grid-cols-1
                    gap-1
                    sm:grid-cols-2
                    md:grid-cols-3
                    lg:grid-cols-4
                    lg:gap-2
                  "
                >
                  {activeSubcategories.map(
                    (subcategory) => (
                      <Link
                        key={subcategory._id}
                        href={`/shop/${encodeURIComponent(
                          activeCategory
                        )}/${encodeURIComponent(
                          subcategory.slug
                        )}`}
                        onClick={() =>
                          setActiveCategory(null)
                        }
                        className="
                          rounded-lg
                          px-4
                          py-3
                          text-sm
                          text-gray-700
                          transition-colors
                          hover:bg-[#7C8B73]/10
                          hover:text-[#66745F]
                          focus:outline-none
                          focus:ring-2
                          focus:ring-[#7C8B73]/40
                        "
                      >
                        {subcategory.name}
                      </Link>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        )}
    </nav>
  );
}