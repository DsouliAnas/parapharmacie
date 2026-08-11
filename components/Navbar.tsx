"use client";

import { useState, useSyncExternalStore } from "react";
import {
  ShoppingCart,
  User,
  Heart,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

import CategoryMenu from "./CategoryMenu";
import { useCart } from "./CartProvider";
import SearchBar from "./SearchBar";

// Returns false on the server and true on the client.
// This prevents hydration mismatches.
function useIsMounted(): boolean {
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  async function handleSignOut() {
    setAccountMenuOpen(false);
    closeMobileMenu();

    await signOut({
      callbackUrl: "/",
    });
  }

  return (
    <header className="border-b border-gray-100 bg-white">
      {/* Main navbar */}
      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((current) => !current)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:bg-gray-100 lg:hidden"
          aria-label={
            mobileMenuOpen
              ? "Fermer le menu"
              : "Ouvrir le menu"
          }
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X size={23} />
          ) : (
            <Menu size={23} />
          )}
        </button>

        {/* Logo */}
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="shrink-0 text-xl font-bold text-[#7C8B73] sm:text-2xl"
        >
          Fairys
        </Link>

        {/* Desktop search */}
        <div className="hidden flex-1 justify-center px-4 md:flex">
          <SearchBar />
        </div>

        {/* Desktop right side */}
        <div className="hidden shrink-0 items-center gap-5 lg:flex">
          {/* Account */}
          {session ? (
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setAccountMenuOpen((current) => !current)
                }
                className="flex max-w-[160px] items-center gap-2 rounded-full px-2 py-2 transition hover:bg-gray-50"
                aria-expanded={accountMenuOpen}
                aria-haspopup="menu"
              >
                <User size={22} />

                <span className="truncate">
                  {session.user?.name || "Mon compte"}
                </span>
              </button>

              {/* Account dropdown */}
              {accountMenuOpen && (
                <div
                  className="absolute right-0 top-full z-50 w-52 pt-2"
                  onMouseLeave={() =>
                    setAccountMenuOpen(false)
                  }
                >
                  <div className="rounded-xl bg-white p-4 shadow-lg ring-1 ring-black/5">
                    <Link
                      href="/account"
                      onClick={() =>
                        setAccountMenuOpen(false)
                      }
                      className="block rounded-lg px-2 py-2 transition hover:bg-gray-50 hover:text-[#7C8B73]"
                    >
                      Mon compte
                    </Link>

                    <Link
                      href="/orders"
                      onClick={() =>
                        setAccountMenuOpen(false)
                      }
                      className="block rounded-lg px-2 py-2 transition hover:bg-gray-50 hover:text-[#7C8B73]"
                    >
                      Mes commandes
                    </Link>

                    <Link
                      href="/wishlist"
                      onClick={() =>
                        setAccountMenuOpen(false)
                      }
                      className="block rounded-lg px-2 py-2 transition hover:bg-gray-50 hover:text-[#7C8B73]"
                    >
                      Wishlist
                    </Link>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="block w-full rounded-lg px-2 py-2 text-left text-red-500 transition hover:bg-red-50 hover:text-red-600"
                    >
                      Déconnexion
                    </button>
                  </div>
                </div>
              )}
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
              <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile cart */}
        <Link
          href="/cart"
          className="relative ml-auto flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-gray-100 lg:hidden"
          aria-label="Panier"
        >
          <ShoppingCart size={22} />

          {mounted && cartCount > 0 && (
            <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white">
              {cartCount}
            </span>
          )}
        </Link>
      </div>

      {/* Mobile search */}
      <div className="px-4 pb-4 md:hidden">
        <SearchBar />
      </div>

      {/* Categories */}
      <div className="hidden lg:block">
        <CategoryMenu />
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white lg:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
            <div className="space-y-2">
              {/* Account */}
              {session ? (
                <>
                  <div className="mb-4 rounded-xl bg-[#F8F3EA] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                        <User size={20} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm text-gray-500">
                          Bonjour
                        </p>

                        <p className="truncate font-semibold text-gray-900">
                          {session.user?.name || "Mon compte"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/account"
                    onClick={closeMobileMenu}
                    className="flex items-center rounded-xl px-4 py-3 transition hover:bg-gray-50"
                  >
                    <User
                      size={19}
                      className="mr-3"
                    />
                    Mon compte
                  </Link>

                  <Link
                    href="/orders"
                    onClick={closeMobileMenu}
                    className="flex items-center rounded-xl px-4 py-3 transition hover:bg-gray-50"
                  >
                    Mes commandes
                  </Link>

                  <Link
                    href="/wishlist"
                    onClick={closeMobileMenu}
                    className="flex items-center rounded-xl px-4 py-3 transition hover:bg-gray-50"
                  >
                    <Heart
                      size={19}
                      className="mr-3"
                    />
                    Wishlist
                  </Link>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center rounded-xl px-4 py-3 text-left text-red-500 transition hover:bg-red-50"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="flex items-center rounded-xl px-4 py-3 transition hover:bg-gray-50"
                >
                  <User
                    size={19}
                    className="mr-3"
                  />
                  Connexion
                </Link>
              )}

              <div className="my-3 border-t border-gray-100" />

              {/* Mobile categories */}
              <Link
                href="/shop"
                onClick={closeMobileMenu}
                className="block rounded-xl px-4 py-3 font-medium text-gray-900 transition hover:bg-gray-50"
              >
                Boutique
              </Link>

              <Link
                href="/wishlist"
                onClick={closeMobileMenu}
                className="block rounded-xl px-4 py-3 text-gray-700 transition hover:bg-gray-50"
              >
                Mes favoris
              </Link>

              <Link
                href="/cart"
                onClick={closeMobileMenu}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-gray-700 transition hover:bg-gray-50"
              >
                <span>Mon panier</span>

                {mounted && cartCount > 0 && (
                  <span className="rounded-full bg-red-500 px-2 py-1 text-xs text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* Cart message */}
      {message && (
        <div className="fixed bottom-4 left-4 right-4 z-50 rounded-xl bg-[#7C8B73] px-5 py-3 text-center text-sm text-white shadow-lg sm:left-auto sm:right-5 sm:max-w-sm">
          {message}
        </div>
      )}
    </header>
  );
}