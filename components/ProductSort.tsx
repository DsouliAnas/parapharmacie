"use client";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

interface SortOption {
  value:
    | "newest"
    | "price-asc"
    | "price-desc"
    | "name";
  label: string;
}

const SORT_OPTIONS: SortOption[] = [
  {
    value: "newest",
    label: "Nouveautés",
  },
  {
    value: "price-asc",
    label: "Prix croissant",
  },
  {
    value: "price-desc",
    label: "Prix décroissant",
  },
  {
    value: "name",
    label: "Nom A-Z",
  },
];

const VALID_SORT_VALUES = new Set(
  SORT_OPTIONS.map((option) => option.value)
);

export default function ProductSort() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sortParameter =
    searchParams.get("sort");

  const currentSort =
    sortParameter &&
    VALID_SORT_VALUES.has(
      sortParameter as SortOption["value"]
    )
      ? sortParameter
      : "newest";

  function handleSortChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ): void {
    const sort = event.target.value;

    if (!VALID_SORT_VALUES.has(
      sort as SortOption["value"]
    )) {
      return;
    }

    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (sort === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", sort);
    }

    const queryString = params.toString();

    router.replace(
      queryString
        ? `/shop?${queryString}`
        : "/shop",
      {
        scroll: false,
      }
    );
  }

  return (
    <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-start">
      <label
        htmlFor="product-sort"
        className="shrink-0 text-sm font-medium text-gray-500"
      >
        Trier par
      </label>

      <select
        id="product-sort"
        value={currentSort}
        onChange={handleSortChange}
        className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition hover:border-gray-300 focus:border-[#7C8B73] focus:ring-2 focus:ring-[#7C8B73]/20 sm:w-auto sm:flex-none sm:px-4"
        aria-label="Trier les produits"
      >
        {SORT_OPTIONS.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}