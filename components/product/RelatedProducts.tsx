import Link from "next/link";

interface RelatedProduct {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images: string[];
  stock: number;
}

interface RelatedProductsProps {
  readonly products: RelatedProduct[];
}

export default function RelatedProducts({
  products,
}: RelatedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#7C8B73]">
          Découvrez également
        </p>

        <h2 className="mt-2 text-3xl font-bold text-gray-900">
          Vous aimerez aussi
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
        {products.map((product) => {
          const finalPrice =
            product.discountPrice ?? product.price;

          return (
            <Link
              key={product._id}
              href={`/products/${product._id}`}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="h-52 overflow-hidden bg-gray-100">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">
                    Pas d&apos;image
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="line-clamp-2 font-semibold text-gray-900">
                  {product.name}
                </h3>

                <div className="mt-3 flex items-center gap-2">
                  <span className="font-bold text-[#7C8B73]">
                    {finalPrice} TND
                  </span>

                  {product.discountPrice &&
                    product.discountPrice <
                      product.price && (
                      <span className="text-sm text-gray-400 line-through">
                        {product.price} TND
                      </span>
                    )}
                </div>

                <p
                  className={`mt-2 text-xs ${
                    product.stock > 0
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {product.stock > 0
                    ? "En stock"
                    : "Rupture de stock"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}