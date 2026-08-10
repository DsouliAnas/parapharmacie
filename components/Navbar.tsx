"use client";

import { useSyncExternalStore } from "react";
import { ShoppingCart, User, Heart } from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

import CategoryMenu from "./CategoryMenu";
import { useCart } from "./CartProvider";
import SearchBar from "./SearchBar";

// Returns false on the server and on the client's first render pass
// to avoid hydration mismatches.
function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function Navbar() {
  const { data: session } = useSession();
  const { cartCount, message } = useCart();
  const mounted = useIsMounted();

  return (
    <header className="bg-white">
      <div className="mx-auto flex items-center justify-between gap-6 px-8 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="shrink-0 text-2xl font-semibold text-[#7C8B73]"
        >
          Fairy&apos;s
        </Link>

        {/* Search */}
        <div className="flex flex-1 justify-center">
          <SearchBar />
        </div>

        {/* Right side */}
        <div className="flex shrink-0 items-center gap-5">
          {/* Account */}
          {session ? (
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-2"
              >
                <User size={22} />

                <span className="max-w-[120px] truncate">
                  {session.user?.name || "Mon compte"}
                </span>
              </button>

              {/* Account dropdown */}
              <div className="absolute right-0 top-full z-50 mt-2 hidden w-48 rounded-xl bg-white p-4 shadow-lg group-hover:block">
                <Link
                  href="/account"
                  className="block py-2 transition hover:text-[#7C8B73]"
                >
                  Mon compte
                </Link>

                <Link
                  href="/orders"
                  className="block py-2 transition hover:text-[#7C8B73]"
                >
                  Mes commandes
                </Link>

                <Link
                  href="/wishlist"
                  className="block py-2 transition hover:text-[#7C8B73]"
                >
                  Wishlist
                </Link>

                <button
                  type="button"
                  onClick={() => signOut()}
                  className="block py-2 text-red-500 transition hover:text-red-600"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 transition hover:text-[#7C8B73]"
            >
              <User size={22} />
              <span>Connexion</span>
            </Link>
          )}

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="transition hover:text-[#7C8B73]"
            aria-label="Wishlist"
          >
            <Heart size={22} />
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative transition hover:text-[#7C8B73]"
            aria-label="Panier"
          >
            <ShoppingCart size={22} />

            {mounted && cartCount > 0 && (
              <span className="absolute -right-3 -top-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Categories */}
      <CategoryMenu />

      {/* Cart message */}
      {message && (
        <div className="fixed bottom-5 right-5 z-50 rounded-full bg-[#7C8B73] px-6 py-3 text-white shadow-lg">
          {message}
        </div>
      )}
    </header>
  );
}