"use client";

import { useState } from "react";
import Link from "next/link";
import { categories } from "@/constants/categories";

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

interface CategoryFromAPI {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

const staticCategorySlugs = new Set([
  "promo",
  "offers",
]);

export default function CategoryMenu() {
  const [activeCategory, setActiveCategory] =
    useState<string | null>(null);

  const [subcategories, setSubcategories] =
    useState<Record<string, Subcategory[]>>({});

  const [loading, setLoading] = useState(false);

  async function loadSubcategories(
    categorySlug: string
  ): Promise<void> {
    // Promo and Offers don't use MongoDB subcategories.
    if (staticCategorySlugs.has(categorySlug)) {
      return;
    }

    // Don't fetch again if already loaded.
    if (
      Object.prototype.hasOwnProperty.call(
        subcategories,
        categorySlug
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      // Get all categories from MongoDB.
      const categoryResponse = await fetch(
        "/api/categories"
      );

      if (!categoryResponse.ok) {
        return;
      }

      const categoryData: CategoryFromAPI[] =
        await categoryResponse.json();

      // Find the MongoDB category using its slug.
      const category = categoryData.find(
        (item) => item.slug === categorySlug
      );

      if (!category) {
        setSubcategories((previous) => ({
          ...previous,
          [categorySlug]: [],
        }));

        return;
      }

      // Get subcategories for this category.
      const response = await fetch(
        `/api/subcategories?category=${category._id}`
      );

      if (!response.ok) {
        return;
      }

      const data: unknown = await response.json();

      const validSubcategories: Subcategory[] =
        Array.isArray(data)
          ? (data as Subcategory[])
          : [];

      setSubcategories((previous) => ({
        ...previous,
        [categorySlug]: validSubcategories,
      }));
    } catch (error) {
      console.error(
        "Failed to load subcategories:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  function handleMouseEnter(
    categorySlug: string
  ): void {
    setActiveCategory(categorySlug);

    void loadSubcategories(categorySlug);
  }

  function handleMouseLeave(): void {
    setActiveCategory(null);
  }

  const activeSubcategories =
    activeCategory !== null
      ? subcategories[activeCategory] ?? []
      : [];

  const isStaticCategory =
    activeCategory !== null &&
    staticCategorySlugs.has(activeCategory);

  const isActiveCategoryLoaded =
    activeCategory !== null &&
    Object.prototype.hasOwnProperty.call(
      subcategories,
      activeCategory
    );

  return (
    <nav
      className="relative border-t bg-white"
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex gap-6 px-8 py-3 text-sm">
        {categories.map((category) => (
          <div
            key={category.slug}
            onMouseEnter={() =>
              handleMouseEnter(category.slug)
            }
            className={`cursor-default whitespace-nowrap transition ${
              activeCategory === category.slug
                ? "text-pink-500"
                : "text-gray-700 hover:text-pink-500"
            }`}
          >
            {category.name}
          </div>
        ))}
      </div>

      {activeCategory !== null &&
        !isStaticCategory && (
          <div
            className="absolute left-0 top-full z-50 w-full border-t bg-white shadow-lg"
            onMouseEnter={() =>
              setActiveCategory(activeCategory)
            }
          >
            <div className="mx-auto max-w-6xl px-8 py-6">
              {loading &&
              !isActiveCategoryLoaded ? (
                <div className="py-4 text-sm text-gray-500">
                  Chargement...
                </div>
              ) : activeSubcategories.length === 0 ? (
                <div className="py-4 text-sm text-gray-500">
                  Aucune sous-catégorie disponible.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-x-10 gap-y-4">
                  {activeSubcategories.map(
                    (subcategory) => (
                      <Link
                        key={subcategory._id}
                        href={`/shop/${activeCategory}/${subcategory.slug}`}
                        className="rounded-lg px-3 py-2 text-gray-700 transition hover:bg-gray-50 hover:text-pink-500"
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