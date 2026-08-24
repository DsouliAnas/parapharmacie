"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProductSuggestion {
  _id: string;
  name: string;
  images?: string[];
}

interface SimpleSuggestion {
  _id: string;
  name: string;
}

interface Suggestions {
  products: ProductSuggestion[];
  brands: SimpleSuggestion[];
  subcategories: SimpleSuggestion[];
}

const emptySuggestions: Suggestions = {
  products: [],
  brands: [],
  subcategories: [],
};

export default function SearchBar() {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] =
    useState<Suggestions>(emptySuggestions);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  /*
   * Fetch suggestions when the user types.
   */
  useEffect(() => {
    const value = search.trim();

    if (!value) {
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(value)}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          return;
        }

        const data: Suggestions =
          await response.json();

        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "SEARCH SUGGESTIONS ERROR:",
          error
        );
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search]);

  /*
   * Close suggestions when clicking outside.
   */
  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        searchRef.current &&
        !searchRef.current.contains(
          event.target as Node
        )
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  function handleSearch(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const value = search.trim();

    setShowSuggestions(false);

    if (!value) {
      router.push("/shop");
      return;
    }

    router.push(
      `/shop?search=${encodeURIComponent(value)}`
    );
  }

  function handleSuggestionClick(
    name: string
  ) {
    setSearch(name);
    setShowSuggestions(false);

    router.push(
      `/shop?search=${encodeURIComponent(name)}`
    );
  }

  const hasSuggestions =
    suggestions.products.length > 0 ||
    suggestions.brands.length > 0 ||
    suggestions.subcategories.length > 0;

  return (
    <div
      ref={searchRef}
      className="relative w-full max-w-md"
    >
      <form
        onSubmit={handleSearch}
        className="flex w-full items-center"
      >
        <div className="relative w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => {
              if (search.trim()) {
                setShowSuggestions(true);
              }
            }}
            placeholder="Rechercher un produit..."
            autoComplete="off"
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

      {showSuggestions &&
        search.trim() &&
        (loading || hasSuggestions) && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-lg">
            {loading ? (
              <div className="px-5 py-4 text-sm text-gray-500">
                Recherche...
              </div>
            ) : (
              <>
                {/* PRODUCTS */}
                {suggestions.products.length >
                  0 && (
                  <div className="border-b border-gray-100">
                    <div className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7C8B73]">
                      Produits
                    </div>

                    {suggestions.products.map(
                      (product) => (
                        <button
                          key={product._id}
                          type="button"
                          onClick={() =>
                            handleSuggestionClick(
                              product.name
                            )
                          }
                          className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-gray-50"
                        >
                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                                —
                              </div>
                            )}
                          </div>

                          <span className="min-w-0 flex-1 truncate text-sm text-gray-800">
                            {product.name}
                          </span>
                        </button>
                      )
                    )}
                  </div>
                )}

                {/* BRANDS */}
                {suggestions.brands.length >
                  0 && (
                  <div className="border-b border-gray-100">
                    <div className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7C8B73]">
                      Marques
                    </div>

                    {suggestions.brands.map(
                      (brand) => (
                        <button
                          key={brand._id}
                          type="button"
                          onClick={() =>
                            handleSuggestionClick(
                              brand.name
                            )
                          }
                          className="flex w-full items-center px-5 py-3 text-left text-sm text-gray-800 transition hover:bg-gray-50"
                        >
                          <Search
                            size={15}
                            className="mr-3 text-gray-400"
                          />

                          {brand.name}
                        </button>
                      )
                    )}
                  </div>
                )}

                {/* SUBCATEGORIES */}
                {suggestions.subcategories.length >
                  0 && (
                  <div>
                    <div className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7C8B73]">
                      Catégories
                    </div>

                    {suggestions.subcategories.map(
                      (subcategory) => (
                        <button
                          key={subcategory._id}
                          type="button"
                          onClick={() =>
                            handleSuggestionClick(
                              subcategory.name
                            )
                          }
                          className="flex w-full items-center px-5 py-3 text-left text-sm text-gray-800 transition hover:bg-gray-50"
                        >
                          <Search
                            size={15}
                            className="mr-3 text-gray-400"
                          />

                          {subcategory.name}
                        </button>
                      )
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
    </div>
  );
}