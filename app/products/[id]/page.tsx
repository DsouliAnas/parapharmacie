import Link from "next/link";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import RelatedProducts from "@/components/product/RelatedProducts";
import ProductRating from "@/components/product/ProductRating";
import ReviewsList from "@/components/product/ReviewsList";
import ReviewForm from "@/components/product/ReviewForm";
import ProductTabs from "@/components/product/ProductTabs";

interface Product {
  _id: string;
  name: string;
  description: string;
  benefits?: string[];
  usage?: string[];
  price: number;
  discountPrice?: number;
  images: string[];
  stock: number;
  isActive: boolean;
  category?: {
    _id: string;
    name: string;
  };
  subcategory?: {
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
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  try {
    const response = await fetch(`${baseUrl}/api/products/${id}`, {
      cache: "no-store",
    });

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
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  try {
    const response = await fetch(
      `${baseUrl}/api/reviews?productId=${productId}`,
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
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  try {
    const response = await fetch(`${baseUrl}/api/products`, {
      cache: "no-store",
    });

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
      <main className="min-h-screen bg-[var(--paper)] px-6 py-24">
        <div className="mx-auto max-w-lg border border-[var(--line)] bg-[var(--paper-deep)] p-12 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--clay)]">
            Fiche introuvable
          </p>

          <h1 className="font-display mt-4 text-3xl font-medium text-[var(--forest)]">
            Produit introuvable
          </h1>

          <p className="mt-3 text-sm leading-6 text-[var(--ink)]/55">
            Ce produit n&apos;existe pas ou n&apos;est plus disponible.
          </p>

          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-2 bg-[var(--forest)] px-7 py-3 text-sm font-semibold text-[var(--paper)] transition hover:bg-[var(--forest-soft)]"
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
      ? reviews.reduce((total, review) => total + review.rating, 0) /
        reviews.length
      : 0;

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
        {/* Fil d'ariane léger */}
        <div className="mb-8 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink)]/45">
          <Link href="/" className="transition hover:text-[var(--clay)]">
            Accueil
          </Link>
          <span className="text-[var(--ink)]/25">/</span>
          <Link href="/shop" className="transition hover:text-[var(--clay)]">
            Boutique
          </Link>
          {product.category?.name && (
            <>
              <span className="text-[var(--ink)]/25">/</span>
              <span className="text-[var(--forest)]">
                {product.category.name}
              </span>
            </>
          )}
        </div>

        {/* Product */}
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images} />
          <ProductInfo product={product} />
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 border-t border-[var(--line)] pt-14">
            <div className="mb-8 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--forest)]">
              <span>N°06 — Produits similaires</span>
              <span className="leader" />
            </div>

            <RelatedProducts products={relatedProducts} />
          </section>
        )}

        {/* Reviews */}
        <ProductTabs product={product} />
      </div>
    </main>
  );
}