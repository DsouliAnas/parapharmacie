"use client";

import {
  useState,
  useSyncExternalStore,
  useEffect,
  useRef,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Menu,
  ShoppingCart,
  User,
  X,
  Grid2X2,
  ShieldCheck,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

import CategoryMenu from "./CategoryMenu";
import { useCart } from "./CartProvider";
import SearchBar from "./SearchBar";

function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function Navbar(): React.ReactElement {
  const { data: session } = useSession();
  const { cartCount, message } = useCart();
  const mounted = useIsMounted();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [accountMenuOpen, setAccountMenuOpen] =
    useState(false);

  const accountMenuRef =
    useRef<HTMLDivElement>(null);

  function closeMobileMenu(): void {
    setMobileMenuOpen(false);
  }

  function closeAccountMenu(): void {
    setAccountMenuOpen(false);
  }

  function closeAllMenus(): void {
    closeMobileMenu();
    closeAccountMenu();
  }

  async function handleSignOut(): Promise<void> {
    closeAllMenus();
    await signOut({ callbackUrl: "/" });
  }

  /*
   * CLOSE ACCOUNT DROPDOWN
   * WHEN CLICKING OUTSIDE
   */
  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ): void {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(
          event.target as Node
        )
      ) {
        setAccountMenuOpen(false);
      }
    }

    if (accountMenuOpen) {
      document.addEventListener(
        "mousedown",
        handleClickOutside
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [accountMenuOpen]);

  return (
    <header className="relative z-50 border-b border-gray-100 bg-white">
      {/* =========================================================
          MAIN NAVBAR
      ========================================================= */}

      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center gap-3 px-4 sm:px-6 lg:gap-6 lg:px-8">
        {/* MOBILE MENU BUTTON */}

        <button
          type="button"
          onClick={() =>
            setMobileMenuOpen(
              (current) => !current
            )
          }
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 hover:text-[#7C8B73] focus:outline-none focus:ring-2 focus:ring-[#7C8B73]/40 lg:hidden"
          aria-label={
            mobileMenuOpen
              ? "Fermer le menu"
              : "Ouvrir le menu"
          }
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          {mobileMenuOpen ? (
            <X size={23} strokeWidth={2} />
          ) : (
            <Menu size={23} strokeWidth={2} />
          )}
        </button>

        {/* =======================================================
            LOGO
        ======================================================= */}

        <Link
          href="/"
          onClick={closeAllMenus}
          className="relative flex shrink-0 items-center rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C8B73]/40"
          aria-label="Fairy's Parapharmacie - Accueil"
        >
          <Image
            src="/logo1.jpeg"
            alt="Fairy's Parapharmacie"
            width={150}
            height={50}
            priority
            className="h-10 w-auto object-contain sm:h-12"
          />
        </Link>

        {/* =======================================================
            DESKTOP SEARCH
        ======================================================= */}

        <div className="hidden min-w-0 flex-1 justify-center px-2 md:flex lg:px-6">
          <div className="w-full max-w-2xl">
            <SearchBar />
          </div>
        </div>

        {/* =======================================================
            DESKTOP ACTIONS
        ======================================================= */}

        <div className="hidden shrink-0 items-center gap-1.5 lg:flex">

{/* ADMIN DASHBOARD */}

{session?.user?.role === "admin" && (
  <Link
    href="/admin"
    onClick={closeAllMenus}
    className="flex items-center gap-2 rounded-full bg-[#7C8B73]/10 px-3 py-2 text-sm font-medium text-[#7C8B73] transition-colors hover:bg-[#7C8B73]/20 focus:outline-none focus:ring-2 focus:ring-[#7C8B73]/30"
    aria-label="Accéder au tableau de bord administrateur"
  >
    <ShieldCheck
      size={20}
      strokeWidth={1.8}
    />

    <span>Admin</span>
  </Link>
)}


          {/* ACCOUNT */}

          {session ? (
            <div
              className="relative"
              ref={accountMenuRef}
            >
              <button
                type="button"
                onClick={() =>
                  setAccountMenuOpen(
                    (current) => !current
                  )
                }
                className={`flex max-w-[180px] items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#7C8B73]/30 ${
                  accountMenuOpen
                    ? "bg-[#7C8B73]/10 text-[#7C8B73]"
                    : "text-gray-700 hover:bg-gray-50 hover:text-[#7C8B73]"
                }`}
                aria-label="Ouvrir le menu du compte"
                aria-expanded={accountMenuOpen}
                aria-haspopup="menu"
              >
                <User
                  size={20}
                  strokeWidth={1.8}
                />

                <span className="truncate">
                  {session.user?.name ||
                    "Mon compte"}
                </span>
              </button>

              {/* ACCOUNT DROPDOWN */}

              {accountMenuOpen && (
                <div
                  className="absolute right-0 top-full z-50 w-56 pt-2"
                  role="menu"
                >
                  <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl">
                    <Link
                      href="/account"
                      onClick={closeAccountMenu}
                      role="menuitem"
                      className="block rounded-xl px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-[#7C8B73]/08 hover:text-[#7C8B73]"
                    >
                      Mon compte
                    </Link>

                    <Link
                      href="/orders"
                      onClick={closeAccountMenu}
                      role="menuitem"
                      className="block rounded-xl px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-[#7C8B73]/08 hover:text-[#7C8B73]"
                    >
                      Mes commandes
                    </Link>

                    <Link
                      href="/wishlist"
                      onClick={closeAccountMenu}
                      role="menuitem"
                      className="block rounded-xl px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-[#7C8B73]/08 hover:text-[#7C8B73]"
                    >
                      Mes favoris
                    </Link>

                    <div className="my-1.5 border-t border-gray-100" />

                    <button
                      type="button"
                      onClick={handleSignOut}
                      role="menuitem"
                      className="block w-full rounded-xl px-4 py-2.5 text-left text-sm text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
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
              onClick={closeAllMenus}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#7C8B73] focus:outline-none focus:ring-2 focus:ring-[#7C8B73]/30"
            >
              <User
                size={20}
                strokeWidth={1.8}
              />

              <span>Connexion</span>
            </Link>
          )}

          {/* WISHLIST */}

          <Link
            href="/wishlist"
            onClick={closeAllMenus}
            className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#7C8B73] focus:outline-none focus:ring-2 focus:ring-[#7C8B73]/30"
            aria-label="Mes favoris"
          >
            <Heart
              size={20}
              strokeWidth={1.8}
            />
          </Link>

          {/* CART */}

          <Link
            href="/cart"
            onClick={closeAllMenus}
            className="relative flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#7C8B73] focus:outline-none focus:ring-2 focus:ring-[#7C8B73]/30"
            aria-label={`Panier${
              mounted && cartCount > 0
                ? `, ${cartCount} article${
                    cartCount > 1
                      ? "s"
                      : ""
                  }`
                : ""
            }`}
          >
            <ShoppingCart
              size={20}
              strokeWidth={1.8}
            />

            {mounted && cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {cartCount > 99
                  ? "99+"
                  : cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* =======================================================
            MOBILE CART
        ======================================================= */}

        <Link
          href="/cart"
          onClick={closeAllMenus}
          className="relative ml-auto flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 hover:text-[#7C8B73] focus:outline-none focus:ring-2 focus:ring-[#7C8B73]/40 lg:hidden"
          aria-label={`Panier${
            mounted && cartCount > 0
              ? `, ${cartCount} article${
                  cartCount > 1 ? "s" : ""
                }`
              : ""
          }`}
        >
          <ShoppingCart
            size={22}
            strokeWidth={1.8}
          />

          {mounted && cartCount > 0 && (
            <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {cartCount > 99
                ? "99+"
                : cartCount}
            </span>
          )}
        </Link>
      </div>

      {/* =========================================================
          MOBILE SEARCH
      ========================================================= */}

      <div className="border-t border-gray-50 px-4 py-3 md:hidden">
        <SearchBar />
      </div>

      {/* =========================================================
          DESKTOP CATEGORY MENU
          
          IMPORTANT:
          This stays desktop-only.
      ========================================================= */}

      <div className="hidden lg:block">
        <CategoryMenu />
      </div>

      {/* =========================================================
          MOBILE MENU
      ========================================================= */}

      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="max-h-[calc(100vh-72px)] overflow-y-auto border-t border-gray-100 bg-white shadow-lg lg:hidden"
        >
          <nav
            className="mx-auto max-w-7xl px-4 py-5 sm:px-6"
            aria-label="Navigation mobile"
          >
            {/* =====================================================
                MOBILE CATEGORIES
            ===================================================== */}

            <section className="mb-5 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-gray-100 bg-[#F8F3EA] px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#7C8B73]">
                  <Grid2X2
                    size={19}
                    strokeWidth={1.8}
                  />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Boutique
                  </p>

                  <p className="text-sm font-semibold text-gray-900">
                    Catégories
                  </p>
                </div>
              </div>

              {/* 
                CategoryMenu is now rendered INSIDE
                the mobile sidebar.
              */}

              <div className="w-full">
                <CategoryMenu />
              </div>
            </section>

            {/* =====================================================
                USER / ACCOUNT
            ===================================================== */}

            <div className="space-y-1">
              {session ? (
                <>
                  <div className="mb-4 rounded-2xl bg-[#F8F3EA] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#7C8B73]">
                        <User
                          size={21}
                          strokeWidth={1.8}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">
                          Bonjour
                        </p>

                        <p className="truncate text-sm font-semibold text-gray-900">
                          {session.user?.name ||
                            "Mon compte"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {session.user?.role === "admin" && (
  <Link
    href="/admin"
    onClick={closeMobileMenu}
    className="mb-2 flex min-h-12 items-center rounded-xl bg-[#7C8B73]/10 px-4 py-3 font-medium text-[#7C8B73] transition-colors hover:bg-[#7C8B73]/20"
  >
    <ShieldCheck
      size={19}
      className="mr-3 shrink-0"
    />

    Tableau de bord Admin
  </Link>
)}

                  <Link
                    href="/account"
                    onClick={closeMobileMenu}
                    className="flex min-h-12 items-center rounded-xl px-4 py-3 text-gray-700 transition-colors hover:bg-[#7C8B73]/08 hover:text-[#7C8B73]"
                  >
                    <User
                      size={19}
                      className="mr-3 shrink-0"
                    />
                    Mon compte
                  </Link>

                  <Link
                    href="/orders"
                    onClick={closeMobileMenu}
                    className="flex min-h-12 items-center rounded-xl px-4 py-3 text-gray-700 transition-colors hover:bg-[#7C8B73]/08 hover:text-[#7C8B73]"
                  >
                    <ShoppingCart
                      size={19}
                      className="mr-3 shrink-0"
                    />
                    Mes commandes
                  </Link>

                  <Link
                    href="/wishlist"
                    onClick={closeMobileMenu}
                    className="flex min-h-12 items-center rounded-xl px-4 py-3 text-gray-700 transition-colors hover:bg-[#7C8B73]/08 hover:text-[#7C8B73]"
                  >
                    <Heart
                      size={19}
                      className="mr-3 shrink-0"
                    />
                    Mes favoris
                  </Link>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex min-h-12 w-full items-center rounded-xl px-4 py-3 text-left text-red-500 transition-colors hover:bg-red-50"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="flex min-h-12 items-center rounded-xl px-4 py-3 text-gray-700 transition-colors hover:bg-[#7C8B73]/08 hover:text-[#7C8B73]"
                >
                  <User
                    size={19}
                    className="mr-3 shrink-0"
                  />
                  Connexion
                </Link>
              )}

              <div className="my-3 border-t border-gray-100" />

              {/* SHOP */}

              <Link
                href="/shop"
                onClick={closeMobileMenu}
                className="flex min-h-12 items-center rounded-xl px-4 py-3 font-medium text-gray-900 transition-colors hover:bg-[#7C8B73]/08 hover:text-[#7C8B73]"
              >
                Boutique
              </Link>

              {/* CART */}

              <Link
                href="/cart"
                onClick={closeMobileMenu}
                className="flex min-h-12 items-center justify-between rounded-xl px-4 py-3 text-gray-700 transition-colors hover:bg-[#7C8B73]/08 hover:text-[#7C8B73]"
              >
                <div className="flex items-center">
                  <ShoppingCart
                    size={19}
                    className="mr-3 shrink-0"
                  />

                  <span>Mon panier</span>
                </div>

                {mounted && cartCount > 0 && (
                  <span className="rounded-full bg-red-500 px-2.5 py-1 text-xs font-semibold text-white">
                    {cartCount > 99
                      ? "99+"
                      : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* =========================================================
          CART SUCCESS MESSAGE
      ========================================================= */}

      {message && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-4 right-4 z-[100] rounded-2xl bg-[#7C8B73] px-5 py-3 text-center text-sm font-medium text-white shadow-xl sm:left-auto sm:right-5 sm:max-w-sm"
        >
          {message}
        </div>
      )}
    </header>
  );
}