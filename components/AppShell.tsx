"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({
  children,
}: AppShellProps): React.ReactElement {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  /*
   * ADMIN ROUTES
   */
  const isAdminRoute =
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  /*
   * AUTHENTICATION PAGES
   *
   * Login and register pages have
   * their own clean layout without
   * the customer Navbar and Footer.
   */
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register";

  const isAdmin =
    session?.user?.role === "admin";

  /*
   * While NextAuth is checking the session,
   * avoid briefly displaying the wrong admin layout.
   */
  if (isAdminRoute && status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F3EA]">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-[#7C8B73]/20 border-t-[#7C8B73]"
          aria-label="Chargement"
        />
      </div>
    );
  }

  /*
   * ADMIN LAYOUT
   *
   * Only authenticated administrators
   * receive the admin interface.
   */
  if (isAdminRoute && isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8F3EA]">
        {/* Desktop sidebar */}
        <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 lg:block">
          <AdminSidebar />
        </aside>

        {/* Admin content */}
        <div className="min-h-screen lg:ml-64">
          {/* Admin navbar */}
          <header className="fixed left-0 right-0 top-0 z-40 h-20 lg:left-64">
            <AdminNavbar />
          </header>

          {/* Admin page content */}
          <main className="min-h-screen pt-20">
            <div className="px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  /*
   * LOGIN / REGISTER
   *
   * These pages do not display the
   * customer Navbar or Footer.
   */
  if (isAuthPage) {
    return (
      <main className="min-h-screen">
        {children}
      </main>
    );
  }

  /*
   * CUSTOMER / PUBLIC LAYOUT
   *
   * All normal customer pages receive
   * the Navbar and Footer.
   */
  return (
    <>
      <Navbar />

      <main className="min-h-screen">
        {children}
      </main>

      <Footer />
    </>
  );
}