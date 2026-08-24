"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface AdminMenuItem {
  label: string;
  href: string;
  icon: string;
}

const menuItems: AdminMenuItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: "📊",
  },
  {
    label: "Produits",
    href: "/admin/products",
    icon: "🛍️",
  },
  {
    label: "Catégories",
    href: "/admin/categories",
    icon: "🗂️",
  },
  {
    label: "Marques",
    href: "/admin/brands",
    icon: "🏷️",
  },
  {
    label: "Commandes",
    href: "/admin/orders",
    icon: "📦",
  },
];

export default function AdminSidebar(): React.ReactElement {
  const pathname: string = usePathname();

  const [isOpen, setIsOpen] =
    useState<boolean>(false);

  function closeMenu(): void {
    setIsOpen(false);
  }

  return (
    <>
      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <div
        className="
          fixed
          left-0
          right-0
          top-0
          z-40
          flex
          h-16
          items-center
          justify-between
          border-b
          border-[#E8E0D5]
          bg-white
          px-4
          shadow-sm
          md:hidden
        "
      >
        {/* LOGO */}

        <div>
          <h1
            className="
              text-xl
              font-bold
              text-[#7C8B73]
            "
          >
            Fairy&apos;s
          </h1>

          <p className="text-[10px] text-gray-500">
            Administration
          </p>
        </div>

        {/* HAMBURGER BUTTON */}

        <button
          type="button"
          onClick={() =>
            setIsOpen(true)
          }
          aria-label="Ouvrir le menu"
          aria-expanded={isOpen}
          className="
            flex
            h-11
            w-11
            flex-col
            items-center
            justify-center
            gap-1.5
            rounded-xl
            bg-[#F8F3EA]
            text-[#394438]
            transition
            hover:bg-[#EDE5D9]
            active:scale-95
          "
        >
          <span
            className="
              block
              h-0.5
              w-5
              rounded-full
              bg-[#394438]
            "
          />

          <span
            className="
              block
              h-0.5
              w-5
              rounded-full
              bg-[#394438]
            "
          />

          <span
            className="
              block
              h-0.5
              w-5
              rounded-full
              bg-[#394438]
            "
          />
        </button>
      </div>

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {isOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={closeMenu}
          className="
            fixed
            inset-0
            z-40
            bg-black/30
            md:hidden
          "
        />
      )}

      {/* =====================================================
          MOBILE SIDEBAR
      ===================================================== */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          flex
          h-screen
          w-72
          flex-col
          border-r
          border-[#E8E0D5]
          bg-white
          shadow-xl
          transition-transform
          duration-300
          ease-in-out
          md:hidden
          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* MOBILE SIDEBAR HEADER */}

        <div
          className="
            flex
            h-20
            shrink-0
            items-center
            justify-between
            border-b
            border-[#E8E0D5]
            px-6
          "
        >
          <div>
            <h1
              className="
                text-2xl
                font-bold
                text-[#7C8B73]
              "
            >
              Fairy&apos;s
            </h1>

            <p className="text-xs text-gray-500">
              Administration
            </p>
          </div>

          {/* CLOSE BUTTON */}

          <button
            type="button"
            onClick={closeMenu}
            aria-label="Fermer le menu"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-[#F8F3EA]
              text-2xl
              text-[#394438]
              transition
              hover:bg-[#EDE5D9]
              active:scale-95
            "
          >
            ×
          </button>
        </div>

        {/* MOBILE MENU */}

        <nav
          className="
            flex-1
            space-y-2
            overflow-y-auto
            p-4
          "
        >
          {menuItems.map(
            (item: AdminMenuItem) => {
              const isActive: boolean =
                pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-4
                    py-3.5
                    text-sm
                    font-medium
                    transition
                    ${
                      isActive
                        ? "bg-[#7C8B73] text-white shadow-sm"
                        : "text-gray-700 hover:bg-[#F8F3EA]"
                    }
                  `}
                >
                  <span className="text-xl">
                    {item.icon}
                  </span>

                  <span>
                    {item.label}
                  </span>
                </Link>
              );
            }
          )}
        </nav>

        {/* MOBILE STORE LINK */}

        <div
          className="
            shrink-0
            border-t
            border-[#E8E0D5]
            p-4
          "
        >
          <Link
            href="/"
            onClick={closeMenu}
            className="
              flex
              items-center
              gap-3
              rounded-xl
              px-4
              py-3.5
              text-sm
              font-medium
              text-gray-700
              transition
              hover:bg-[#F8F3EA]
            "
          >
            <span className="text-xl">
              🏪
            </span>

            <span>
              Voir la boutique
            </span>
          </Link>
        </div>
      </aside>

      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside
        className="
          fixed
          left-0
          top-0
          z-40
          hidden
          h-screen
          w-64
          flex-col
          border-r
          border-[#E8E0D5]
          bg-white
          md:flex
        "
      >
        {/* DESKTOP HEADER */}

        <div
          className="
            flex
            h-20
            shrink-0
            items-center
            border-b
            border-[#E8E0D5]
            px-6
          "
        >
          <div>
            <h1
              className="
                text-2xl
                font-bold
                text-[#7C8B73]
              "
            >
              Fairy&apos;s
            </h1>

            <p className="text-xs text-gray-500">
              Administration
            </p>
          </div>
        </div>

        {/* DESKTOP MENU */}

        <nav
          className="
            flex-1
            space-y-2
            overflow-y-auto
            p-4
          "
        >
          {menuItems.map(
            (item: AdminMenuItem) => {
              const isActive: boolean =
                pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    font-medium
                    transition
                    ${
                      isActive
                        ? "bg-[#7C8B73] text-white shadow-sm"
                        : "text-gray-700 hover:bg-[#F8F3EA]"
                    }
                  `}
                >
                  <span className="text-lg">
                    {item.icon}
                  </span>

                  <span>
                    {item.label}
                  </span>
                </Link>
              );
            }
          )}
        </nav>

        {/* DESKTOP STORE */}

        <div
          className="
            shrink-0
            border-t
            border-[#E8E0D5]
            p-4
          "
        >
          <Link
            href="/"
            className="
              flex
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-sm
              font-medium
              text-gray-700
              transition
              hover:bg-[#F8F3EA]
            "
          >
            <span className="text-lg">
              🏪
            </span>

            <span>
              Voir la boutique
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
}