import WishlistCard from "@/components/WishlistCard";
import { cookies } from "next/headers";

interface WishlistProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
}

interface WishlistItem {
  _id: string;
  product: WishlistProduct;
}

async function getWishlist(): Promise<WishlistItem[]> {
  const cookieStore = await cookies();

  const baseUrl =
    process.env.NEXTAUTH_URL || "http://localhost:3000";

  try {
    const response = await fetch(`${baseUrl}/api/wishlist`, {
      headers: {
        Cookie: cookieStore.toString(),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data: unknown = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    return data as WishlistItem[];
  } catch (error: unknown) {
    console.error("WISHLIST ERROR:", error);
    return [];
  }
}

export default async function WishlistPage() {
  const wishlist = await getWishlist();

  return (
    <main className="min-h-screen bg-[#F8F3EA] px-5 py-10 md:px-10 md:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#7C8B73]">
            Mon compte
          </p>

          <h1 className="mt-2 text-4xl font-bold text-[#3F493A]">
            Ma wishlist ❤️
          </h1>

          <p className="mt-2 text-gray-600">
            Retrouvez ici les produits que vous avez enregistrés.
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="rounded-2xl bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#7C8B73]/10 text-3xl">
              ❤️
            </div>

            <h2 className="mt-5 text-2xl font-semibold text-gray-800">
              Votre wishlist est vide
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-500">
              Ajoutez vos produits préférés à votre wishlist pour les
              retrouver facilement.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {wishlist.map((item) => (
              <WishlistCard
                key={item._id}
                item={item}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}