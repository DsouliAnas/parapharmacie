import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({
  children,
}: AdminLayoutProps): React.ReactElement {
  return (
    <div className="min-h-screen bg-[#F8F3EA]">
      <AdminSidebar />

      <AdminNavbar />

      <main
        className="
          min-h-screen
          pt-20
          md:ml-64
        "
      >
        <div
          className="
            w-full
            px-4
            py-6
            sm:px-6
            lg:px-10
          "
        >
          {children}
        </div>
      </main>
    </div>
  );
}