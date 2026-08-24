import ProductManager from "@/components/admin/products/ProductManager";

async function getProducts() {
  const baseUrl =
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000";

  const response = await fetch(
    `${baseUrl}/api/products`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch products"
    );
  }

  return response.json();
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main
      className="
        min-h-screen
        w-full
        overflow-x-hidden
        bg-[#F8F3EA]
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-7xl
          px-3
          py-5
          sm:px-5
          sm:py-7
          md:px-6
          md:py-8
          lg:px-10
          lg:py-12
        "
      >
        <ProductManager
          products={products}
        />
      </div>
    </main>
  );
}