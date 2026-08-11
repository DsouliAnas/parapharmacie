import Link from "next/link";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import RelatedProducts from "@/components/product/RelatedProducts";
import ProductRating from "@/components/product/ProductRating";
import ReviewsList from "@/components/product/ReviewsList";
import ReviewForm from "@/components/product/ReviewForm";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  stock: number;
  isActive: boolean;
  category?: {
    _id: string;
    name: string;
  };
  brand?: {
    _id: string;
    name: string;
  };
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  name: string;
  createdAt?: string;
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const response = await fetch(
      `http://localhost:3000/api/products/${id}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const data: Product = await response.json();

    return data;
  } catch {
    return null;
  }
}

async function getReviews(productId: string): Promise<Review[]> {
  try {
    const response = await fetch(
      `http://localhost:3000/api/reviews?productId=${productId}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return [];
    }

    const data: Review[] = await response.json();

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(
      "http://localhost:3000/api/products",
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return [];
    }

    const data: Product[] = await response.json();

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await getProduct(id);

  if (!product) {
    return (
      <main className="min-h-screen bg-[#F8F3EA] px-6 py-20">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-12 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">
            Produit introuvable
          </h1>

          <p className="mt-3 text-gray-500">
            Ce produit n&apos;existe pas ou n&apos;est plus disponible.
          </p>

          <Link
            href="/shop"
            className="mt-8 inline-block rounded-full bg-[#7C8B73] px-7 py-3 font-semibold text-white transition hover:bg-[#66745F]"
          >
            Retour à la boutique
          </Link>
        </div>
      </main>
    );
  }

  const [reviews, allProducts] = await Promise.all([
    getReviews(id),
    getProducts(),
  ]);

  const relatedProducts = allProducts
    .filter(
      (productItem) =>
        productItem._id !== product._id &&
        productItem.isActive !== false &&
        productItem.category?._id &&
        product.category?._id &&
        productItem.category._id === product.category._id
    )
    .slice(0, 4);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (total, review) => total + review.rating,
          0
        ) / reviews.length
      : 0;

  return (
    <main className="min-h-screen bg-[#F8F3EA]">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
        {/* Product */}
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Gallery */}
          <ProductGallery images={product.images} />

          {/* Information */}
          <ProductInfo product={product} />
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 border-t border-gray-200 pt-16">
            <RelatedProducts products={relatedProducts} />
          </section>
        )}

        {/* Reviews */}
        <section className="mt-20 border-t border-gray-200 pt-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Avis clients
            </h2>

            <p className="mt-2 text-gray-500">
              Découvrez les avis des clients sur ce produit.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
            {/* Rating summary */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <ProductRating
                rating={averageRating}
                count={reviews.length}
              />
            </div>

            {/* Reviews */}
            <div>
              <ReviewsList productId={product._id} />
            </div>
          </div>

          {/* Review form */}
          <div className="mt-12 rounded-2xl bg-white p-6 shadow-sm md:p-8">
            <ReviewForm productId={product._id} />
          </div>
        </section>
      </div>
    </main>
  );
}