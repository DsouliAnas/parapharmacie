"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function ProductSort() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "newest";

  function handleSort(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="product-sort"
        className="text-sm font-medium text-gray-600"
      >
        Trier par :
      </label>

      <select
        id="product-sort"
        value={currentSort}
        onChange={(event) => handleSort(event.target.value)}
        className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-[#7C8B73]"
      >
        <option value="newest">Nouveautés</option>
        <option value="price-asc">Prix croissant</option>
        <option value="price-desc">Prix décroissant</option>
        <option value="name">Nom</option>
      </select>
    </div>
  );
}