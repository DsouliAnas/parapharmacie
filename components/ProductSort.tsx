"use client";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

export default function ProductSort() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort =
    searchParams.get("sort") || "newest";

  function handleSortChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const sort = event.target.value;

    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (sort) {
      params.set("sort", sort);
    } else {
      params.delete("sort");
    }

    router.push(`/shop?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="product-sort"
        className="text-sm text-gray-500"
      >
        Trier par
      </label>

      <select
        id="product-sort"
        value={currentSort}
        onChange={handleSortChange}
        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 outline-none transition focus:border-[#7C8B73]"
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
    </div>
  );
}