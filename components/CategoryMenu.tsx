"use client";

import Link from "next/link";
import { useState } from "react";
import { categories } from "@/constants/categories";

interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  category: {
    _id: string;
    name: string;
  };
}

interface CategoryFromAPI {
  _id: string;
  name: string;
  image?: string;
}

export default function CategoryMenu() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [subcategories, setSubcategories] = useState<
    Record<string, Subcategory[]>
  >({});

  const [loading, setLoading] = useState(false);

  async function loadSubcategories(categorySlug: string) {
    // Already loaded
    if (subcategories[categorySlug]) {
      return;
    }

    setLoading(true);

    try {
      // Get all categories from MongoDB
      const categoryResponse = await fetch("/api/categories");

      if (!categoryResponse.ok) {
        return;
      }

      const categoryData: CategoryFromAPI[] =
        await categoryResponse.json();

      // Find the MongoDB category matching the navbar slug
      const category = categoryData.find(
        (item) =>
          item.name
            .toLowerCase()
            .replace(/\s+/g, "-") === categorySlug
      );

      if (!category) {
        setSubcategories((previous) => ({
          ...previous,
          [categorySlug]: [],
        }));

        return;
      }

      // Get subcategories for this category
      const response = await fetch(
        `/api/subcategories?category=${category._id}`
      );

      if (!response.ok) {
        return;
      }

      const data: Subcategory[] = await response.json();

      setSubcategories((previous) => ({
        ...previous,
        [categorySlug]: Array.isArray(data) ? data : [],
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

  function handleMouseEnter(categorySlug: string) {
    setActiveCategory(categorySlug);

    loadSubcategories(categorySlug);
  }

  function handleMouseLeave() {
    setActiveCategory(null);
  }

  const activeSubcategories = activeCategory
    ? subcategories[activeCategory] || []
    : [];

  return (
    <nav
      className="relative border-t bg-white"
      onMouseLeave={handleMouseLeave}
    >
      {/* Main categories */}
      <div className="flex gap-6 px-8 py-3 text-sm">
        {categories.map((category) => (
          <div
            key={category.slug}
            onMouseEnter={() =>
              handleMouseEnter(category.slug)
            }
          >
            <Link
              href={`/shop/${category.slug}`}
              className={`whitespace-nowrap transition ${
                activeCategory === category.slug
                  ? "text-pink-500"
                  : "hover:text-pink-500"
              }`}
            >
              {category.name}
            </Link>
          </div>
        ))}
      </div>

      {/* Dropdown */}
      {activeCategory && (
        <div
          className="absolute left-0 top-full z-50 w-full border-t bg-white shadow-lg"
          onMouseEnter={() =>
            setActiveCategory(activeCategory)
          }
        >
          <div className="mx-auto max-w-6xl px-8 py-6">
            {loading &&
            !subcategories[activeCategory] ? (
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