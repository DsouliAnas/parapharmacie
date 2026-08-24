"use client";

import { signOut } from "next-auth/react";

interface AdminNavbarProps {
  adminName?: string;
  adminEmail?: string;
}

export default function AdminNavbar({
  adminName = "Fairy's Admin",
  adminEmail = "admin@fairys.tn",
}: AdminNavbarProps): React.ReactElement {
  async function handleLogout(): Promise<void> {
    await signOut({
      callbackUrl: "/login",
    });
  }

  const initials: string = adminName
    .split(" ")
    .map((word: string) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      className="
        fixed
        top-0
        left-0
        right-0
        md:left-64
        z-30
        h-16
        border-b
        border-[#E8E0D5]
        bg-white/95
        backdrop-blur-sm
      "
    >
      <div
        className="
          flex
          h-full
          items-center
          justify-between
          px-4
          sm:px-6
        "
      >
        <div className="min-w-0">
          <h2
            className="
              truncate
              text-lg
              font-semibold
              text-gray-800
            "
          >
            Administration
          </h2>

          <p
            className="
              hidden
              text-sm
              text-gray-500
              sm:block
            "
          >
            Gérez votre boutique Fairy&apos;s
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-[#7C8B73]
                text-xs
                font-bold
                text-white
                shrink-0
              "
            >
              {initials}
            </div>

            <div
              className="
                hidden
                lg:block
              "
            >
              <p
                className="
                  text-sm
                  font-semibold
                  text-gray-800
                "
              >
                {adminName}
              </p>

              <p
                className="
                  text-xs
                  text-gray-500
                "
              >
                {adminEmail}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="
                rounded-lg
                border
                border-red-200
                px-3
                py-2
                text-sm
                font-medium
                text-red-600
                transition-all
                hover:bg-red-50
              "
            >
              <span className="hidden sm:inline">
                Déconnexion
              </span>

              <span className="sm:hidden">
                ↪
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}