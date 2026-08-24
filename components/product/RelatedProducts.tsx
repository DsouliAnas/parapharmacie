import Image from "next/image";
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
    <section
      aria-labelledby="related-products-title"
      className="w-full"
    >
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#7C8B73]">
          Découvrez également
        </p>

        <h2
          id="related-products-title"
          className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl"
        >
          Vous aimerez aussi
        </h2>
      </div>

      {/* Products */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => {
          const hasDiscount =
            typeof product.discountPrice === "number" &&
            product.discountPrice >= 0 &&
            product.discountPrice < product.price;

            const finalPrice: number = hasDiscount
              ? product.discountPrice!
              : product.price;

          const image = product.images?.find(
            (item) =>
              typeof item === "string" &&
              item.trim() !== ""
          );

          const productHref = `/products/${encodeURIComponent(
            product._id
          )}`;

          return (
            <Link
              key={product._id}
              href={productHref}
              aria-label={`Voir le produit ${product.name}`}
              className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C8B73] focus-visible:ring-offset-2"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-100 sm:aspect-[4/5]">
                {image ? (
                  <Image
                    src={image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center px-3 text-center text-xs text-gray-400 sm:text-sm"
                    aria-label="Aucune image disponible"
                  >
                    Pas d&apos;image
                  </div>
                )}

                {/* Discount badge */}
                {hasDiscount && (
                  <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm sm:left-3 sm:top-3 sm:text-xs">
                    PROMO
                  </span>
                )}
              </div>

              {/* Product information */}
              <div className="flex flex-1 flex-col p-3 sm:p-4">
                <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-5 text-gray-900 sm:text-base">
                  {product.name}
                </h3>

                {/* Price */}
                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm font-bold text-[#7C8B73] sm:text-base">
                    {finalPrice.toFixed(2)} TND
                  </span>

                  {hasDiscount && (
                    <span className="text-xs text-gray-400 line-through sm:text-sm">
                      {product.price.toFixed(2)} TND
                    </span>
                  )}
                </div>

                {/* Stock */}
                <div className="mt-auto pt-3">
                  {product.stock > 0 ? (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full bg-green-500 sm:h-2 sm:w-2"
                      />
                      En stock
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-red-500">
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full bg-red-500 sm:h-2 sm:w-2"
                      />
                      Rupture de stock
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}