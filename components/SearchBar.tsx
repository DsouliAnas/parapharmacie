"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const value = search.trim();

    if (!value) {
      router.push("/shop");
      return;
    }

    router.push(`/shop?search=${encodeURIComponent(value)}`);
  }

  return (
    <form
      onSubmit={handleSearch}
      className="flex w-full max-w-md items-center"
    >
      <div className="relative w-full">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un produit..."
          className="w-full rounded-full border border-gray-200 bg-white py-3 pl-5 pr-12 text-sm outline-none transition focus:border-[#7C8B73]"
        />

        <button
          type="submit"
          aria-label="Rechercher"
          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#7C8B73] text-white transition hover:opacity-90"
        >
          <Search size={17} />
        </button>
      </div>
    </form>
  );
}