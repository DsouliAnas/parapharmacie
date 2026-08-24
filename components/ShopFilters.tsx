"use client";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useState } from "react";
import {
  SlidersHorizontal,
  X,
} from "lucide-react";

interface Category {
  _id: string;
  name: string;
}

interface Brand {
  _id: string;
  name: string;
}

interface ShopFiltersProps {
  categories: Category[];
  brands: Brand[];
}

export default function ShopFilters({
  categories,
  brands,
}: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const currentCategory =
    searchParams.get("category") || "";

  const currentBrand =
    searchParams.get("brand") || "";

  const currentMinPrice =
    searchParams.get("minPrice") || "";

  const currentMaxPrice =
    searchParams.get("maxPrice") || "";

  const currentInStock =
    searchParams.get("inStock") === "true";

  const [minPrice, setMinPrice] =
    useState(currentMinPrice);

  const [maxPrice, setMaxPrice] =
    useState(currentMaxPrice);

  function updateFilter(
    type: "category" | "brand",
    value: string
  ): void {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (value) {
      params.set(type, value);
    } else {
      params.delete(type);
    }

    router.push(
      params.toString()
        ? `/shop?${params.toString()}`
        : "/shop"
    );
  }

  function updatePriceFilter(): void {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (minPrice.trim()) {
      params.set(
        "minPrice",
        minPrice.trim()
      );
    } else {
      params.delete("minPrice");
    }

    if (maxPrice.trim()) {
      params.set(
        "maxPrice",
        maxPrice.trim()
      );
    } else {
      params.delete("maxPrice");
    }

    router.push(
      params.toString()
        ? `/shop?${params.toString()}`
        : "/shop"
    );

    setMobileOpen(false);
  }

  function toggleStockFilter(): void {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (currentInStock) {
      params.delete("inStock");
    } else {
      params.set("inStock", "true");
    }

    router.push(
      params.toString()
        ? `/shop?${params.toString()}`
        : "/shop"
    );
  }

  function clearFilters(): void {
    const params = new URLSearchParams();

    const search =
      searchParams.get("search");

    const sort =
      searchParams.get("sort");

    if (search) {
      params.set("search", search);
    }

    if (sort) {
      params.set("sort", sort);
    }

    setMinPrice("");
    setMaxPrice("");
    setMobileOpen(false);

    router.push(
      params.toString()
        ? `/shop?${params.toString()}`
        : "/shop"
    );
  }

  const hasFilters = Boolean(
    currentCategory ||
      currentBrand ||
      currentMinPrice ||
      currentMaxPrice ||
      currentInStock
  );

  const filterContentProps: FilterContentProps = {
    categories,
    brands,
    currentCategory,
    currentBrand,
    currentInStock,
    minPrice,
    maxPrice,
    setMinPrice,
    setMaxPrice,
    updateFilter,
    updatePriceFilter,
    toggleStockFilter,
  };

  return (
    <>
      {/* Mobile filter button */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() =>
            setMobileOpen(true)
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-sm transition hover:shadow-md"
        >
          <SlidersHorizontal
            size={18}
          />

          Filtres

          {hasFilters && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#7C8B73] px-1.5 text-[11px] text-white">
              {[
                currentCategory,
                currentBrand,
                currentMinPrice,
                currentMaxPrice,
                currentInStock
                  ? "stock"
                  : "",
              ].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 lg:hidden"
          onClick={() =>
            setMobileOpen(false)
          }
        >
          <aside
            className="absolute right-0 top-0 h-full w-[min(88vw,380px)] overflow-y-auto bg-white p-6 shadow-xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Filtres
              </h2>

              <button
                type="button"
                onClick={() =>
                  setMobileOpen(false)
                }
                aria-label="Fermer les filtres"
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            <FilterContent
              {...filterContentProps}
            />
          </aside>
        </div>
      )}

      {/* Desktop filters */}
      <aside className="hidden w-64 shrink-0 rounded-2xl bg-white p-6 shadow-sm lg:block">
        <div className="sticky top-24">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Filtres
            </h2>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-[#7C8B73] hover:underline"
              >
                Effacer
              </button>
            )}
          </div>

          <FilterContent
            {...filterContentProps}
          />
        </div>
      </aside>
    </>
  );
}

interface FilterContentProps {
  categories: Category[];
  brands: Brand[];
  currentCategory: string;
  currentBrand: string;
  currentInStock: boolean;
  minPrice: string;
  maxPrice: string;
  setMinPrice: (value: string) => void;
  setMaxPrice: (value: string) => void;
  updateFilter: (
    type: "category" | "brand",
    value: string
  ) => void;
  updatePriceFilter: () => void;
  toggleStockFilter: () => void;
}

function FilterContent({
  categories,
  brands,
  currentCategory,
  currentBrand,
  currentInStock,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  updateFilter,
  updatePriceFilter,
  toggleStockFilter,
}: FilterContentProps): React.ReactElement {
  return (
    <>
      {/* Categories */}
      <div className="mb-8">
        <h3 className="mb-4 font-medium text-gray-800">
          Catégories
        </h3>

        {categories.length === 0 ? (
          <p className="text-sm text-gray-500">
            Aucune catégorie disponible.
          </p>
        ) : (
          <div className="max-h-52 space-y-3 overflow-y-auto pr-2">
            {categories.map(
              (category) => (
                <label
                  key={category._id}
                  className="flex cursor-pointer items-center gap-3 text-sm text-gray-600 transition hover:text-[#7C8B73]"
                >
                  <input
                    type="radio"
                    name="category"
                    value={category._id}
                    checked={
                      currentCategory ===
                      category._id
                    }
                    onChange={() =>
                      updateFilter(
                        "category",
                        category._id
                      )
                    }
                    className="h-4 w-4 accent-[#7C8B73]"
                  />

                  <span>
                    {category.name}
                  </span>
                </label>
              )
            )}
          </div>
        )}
      </div>

      {/* Brands */}
      <div className="mb-8">
        <h3 className="mb-4 font-medium text-gray-800">
          Marques
        </h3>

        {brands.length === 0 ? (
          <p className="text-sm text-gray-500">
            Aucune marque disponible.
          </p>
        ) : (
          <div className="max-h-52 space-y-3 overflow-y-auto pr-2">
            {brands.map((brand) => (
              <label
                key={brand._id}
                className="flex cursor-pointer items-center gap-3 text-sm text-gray-600 transition hover:text-[#7C8B73]"
              >
                <input
                  type="radio"
                  name="brand"
                  value={brand._id}
                  checked={
                    currentBrand ===
                    brand._id
                  }
                  onChange={() =>
                    updateFilter(
                      "brand",
                      brand._id
                    )
                  }
                  className="h-4 w-4 accent-[#7C8B73]"
                />

                <span>
                  {brand.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="mb-8">
        <h3 className="mb-4 font-medium text-gray-800">
          Prix
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={minPrice}
            onChange={(event) =>
              setMinPrice(
                event.target.value
              )
            }
            className="min-w-0 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-[#7C8B73]"
          />

          <input
            type="number"
            min="0"
            placeholder="Max"
            value={maxPrice}
            onChange={(event) =>
              setMaxPrice(
                event.target.value
              )
            }
            className="min-w-0 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-[#7C8B73]"
          />
        </div>

        <button
          type="button"
          onClick={updatePriceFilter}
          className="mt-3 w-full rounded-lg bg-[#7C8B73] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#66745F]"
        >
          Appliquer
        </button>
      </div>

      {/* Stock */}
      <div>
        <h3 className="mb-4 font-medium text-gray-800">
          Disponibilité
        </h3>

        <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={currentInStock}
            onChange={toggleStockFilter}
            className="h-4 w-4 rounded accent-[#7C8B73]"
          />

          <span>
            Uniquement en stock
          </span>
        </label>
      </div>
    </>
  );
}