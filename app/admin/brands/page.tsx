import BrandManager from "@/components/admin/brands/BrandManager";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Brand from "@/models/Brand";

interface BrandData {
  _id: string;
  name: string;
  logo?: string;
}

async function getBrands(): Promise<BrandData[]> {
  await connectDB();

  const brands = await Brand.find({})
    .select("_id name logo")
    .sort({ name: 1 })
    .lean();

  return brands.map((brand) => ({
    _id: String(brand._id),
    name: brand.name,
    logo:
      typeof brand.logo === "string"
        ? brand.logo
        : undefined,
  }));
}

export default async function BrandsPage() {
  const session = await getServerSession(authOptions);

  /*
   * SECURITY:
   * Never rely on the client-side UI to protect an admin page.
   *
   * The server checks the authenticated user's role before
   * rendering the page.
   */
  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  const brands = await getBrands();

  return (
    <main className="min-h-screen bg-[#F8F3EA] p-10">
      <BrandManager brands={brands} />
    </main>
  );
}