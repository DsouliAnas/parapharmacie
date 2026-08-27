import Image from "next/image";
import ContactForm from "@/components/ContactForm";
import Link from "next/link";
import {
  MapPin,
  Clock3,
  Mail,
  Phone,
  Send,
} from "lucide-react";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import PromotionsCarousel from "@/components/PromotionsCarousel";
import ProductCard from "@/components/ProductCard";
import BrandCard from "@/components/BrandCard";
export const dynamic = "force-dynamic";

interface ProductBrand {
  _id: string;
  name: string;
  logo?: string;
}

interface ProductCategory {
  _id: string;
  name: string;
  slug?: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images: string[];
  stock: number;
  salesCount?: number;
  brand?: ProductBrand;
  category?: ProductCategory;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

interface Brand {
  _id: string;
  name: string;
  logo?: string;
}

interface ValueItem {
  icon: typeof ShieldCheck;
  title: string;
  text: string;
}

const values: ValueItem[] = [
  {
    icon: ShieldCheck,
    title: "Produits authentiques",
    text: "Des marques fiables et reconnues, sélectionnées avec soin pour votre beauté et votre bien-être.",
  },
  {
    icon: Truck,
    title: "Livraison rapide",
    text: "Recevez vos commandes facilement et profitez d'une expérience simple du panier jusqu'à la livraison.",
  },
  {
    icon: Sparkles,
    title: "Conseils beauté",
    text: "Une sélection pensée pour répondre aux besoins de votre peau, de vos cheveux et de votre quotidien.",
  },
];

async function getProducts(): Promise<Product[]> {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  try {
    const response = await fetch(`${baseUrl}/api/products`, {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to fetch products:", response.status);
      return [];
    }

    const data: unknown = await response.json();
    return Array.isArray(data) ? (data as Product[]) : [];
  } catch (error: unknown) {
    console.error("GET PRODUCTS ERROR:", error);
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  try {
    const response = await fetch(`${baseUrl}/api/categories`, {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to fetch categories:", response.status);
      return [];
    }

    const data: unknown = await response.json();
    return Array.isArray(data) ? (data as Category[]) : [];
  } catch (error: unknown) {
    console.error("GET CATEGORIES ERROR:", error);
    return [];
  }
}

async function getBrands(): Promise<Brand[]> {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  try {
    const response = await fetch(`${baseUrl}/api/brands`, {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to fetch brands:", response.status);
      return [];
    }

    const data: unknown = await response.json();
    return Array.isArray(data) ? (data as Brand[]) : [];
  } catch (error: unknown) {
    console.error("GET BRANDS ERROR:", error);
    return [];
  }
}

function getDiscountPercentage(
  product: Pick<Product, "price" | "discountPrice">
): number {
  if (
    typeof product.discountPrice !== "number" ||
    product.discountPrice >= product.price ||
    product.price <= 0
  ) {
    return 0;
  }

  return Math.round(
    ((product.price - product.discountPrice) / product.price) * 100
  );
}

/** Petite étiquette "N°0X — LIBELLÉ" suivie d'un filet pointillé —
 *  le dispositif de repérage utilisé dans toute la page, comme
 *  les fiches d'un catalogue d'officine. */
function Eyebrow({
  index,
  label,
  tone = "ink",
}: {
  index: string;
  label: string;
  tone?: "ink" | "paper";
}) {
  const color = tone === "paper" ? "text-[var(--paper)]/70" : "text-[var(--forest)]";
  return (
    <div className={`flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] ${color}`}>
      <span>N°{index} — {label}</span>
      <span className="leader" />
    </div>
  );
}

export default async function Home() {
  const [products, categories, brands] = await Promise.all([
    getProducts(),
    getCategories(),
    getBrands(),
  ]);

const promotionalProducts = products
  .filter(
    (product) =>
      typeof product.discountPrice === "number" &&
      product.discountPrice > 0 &&
      product.discountPrice < product.price
  )
  .sort((a, b) => getDiscountPercentage(b) - getDiscountPercentage(a));

  const bestSellers = [...products]
    .sort((a, b) => {
      const salesA = typeof a.salesCount === "number" ? a.salesCount : 0;
      const salesB = typeof b.salesCount === "number" ? b.salesCount : 0;
      return salesB - salesA;
    })
    .slice(0, 4);

  /* Bande "spécimen" sous le héro — huit produits présentés comme
     des planches numérotées plutôt qu'un collage flottant. */
  const specimenImages = products
    .map((product) => ({ src: product.images?.[0], name: product.name }))
    .filter(
      (item): item is { src: string; name: string } => Boolean(item.src)
    )
    .slice(0, 8);

  const visibleCategories = categories.slice(0, 6);
  const visibleBrands = brands.slice(0, 12);

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--paper)]">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden bg-[var(--forest)] px-6 pb-14 pt-16 md:px-16 md:pt-24">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-[var(--gold)]/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[var(--line-dark)]" />

        <div className="relative mx-auto max-w-6xl">
          <div className="reveal flex items-center justify-between border-b border-[var(--line-dark)] pb-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--paper)]/60">
            <span>Fairy&apos;s — Maison de parapharmacie</span>
            <span className="hidden sm:inline">Tunis</span>
          </div>

          <div className="grid gap-14 pt-14 md:grid-cols-[1.2fr_0.8fr] md:items-end md:pt-16">
            <div className="reveal">
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-[var(--gold)]/40">
                  <Image
                    src="/logo1.jpeg"
                    fill
                    priority
                    sizes="150px"
                    alt="Fairy's"
                    className="object-cover"
                  />
                </div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--gold)]">
                  Beauté · Santé · Bien-être
                </p>
              </div>

              <h1 className="font-display mt-8 text-5xl font-medium leading-[1.02] text-[var(--paper)] md:text-7xl">
                Le soin,
                <span className="block italic text-[var(--gold)]">
                  sans compromis.
                </span>
              </h1>

              <p className="mt-7 max-w-md text-[15px] leading-7 text-[var(--paper)]/65">
                Une sélection contrôlée de produits santé, beauté et
                bien-être — pensée comme une officine, présentée comme
                une maison.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-[var(--gold)] px-7 py-3.5 text-sm font-semibold text-[var(--forest)] transition hover:brightness-95"
                >
                  Découvrir la boutique
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 border border-[var(--paper)]/25 px-7 py-3.5 text-sm font-semibold text-[var(--paper)] transition hover:border-[var(--paper)]/60"
                >
                  Voir tout le catalogue
                </Link>
              </div>
            </div>

            {/* FICHE — statistiques en filet pointillé */}
            <div className="reveal space-y-3 border-l border-[var(--line-dark)] pl-6">
              {[
                ["Sélection contrôlée", "100 %"],
                ["Livraison", "48 h"],
                ["Règlement", "à la livraison"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-baseline gap-2 text-[13px] text-[var(--paper)]/75"
                >
                  <span className="uppercase tracking-[0.14em]">{label}</span>
                  <span className="leader" />
                  <span className="font-display italic text-[var(--gold)]">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* BANDE SPÉCIMEN */}
          {specimenImages.length > 0 && (
            <div className="reveal mt-16 flex gap-3 overflow-x-auto pb-2">
              {specimenImages.map((item, index) => (
                <div
                  key={`${item.src}-${index}`}
                  className="group relative h-24 w-24 shrink-0 overflow-hidden border border-[var(--line-dark)] bg-[var(--forest-soft)] md:h-28 md:w-28"
                >
                  <span className="absolute left-1.5 top-1.5 z-10 text-[10px] font-semibold tracking-[0.1em] text-[var(--paper)]/50">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <img
                    src={item.src}
                    alt={item.name}
                    className="h-full w-full object-cover opacity-80 grayscale transition duration-500 group-hover:opacity-100 group-hover:grayscale-0"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

{/* =====================================================
    PROMOTIONS — Dynamic slider (4–5 visible)
===================================================== */}
{promotionalProducts.length > 0 && (
  <section className="bg-[var(--paper)] px-6 py-20 md:px-16">
    <div className="mx-auto max-w-6xl">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow index="01" label="Promotions exclusives" />
          <h2 className="font-display mt-4 text-4xl font-medium text-[var(--forest)] md:text-5xl">
            Offres spéciales
          </h2>
          <p className="mt-4 max-w-2xl text-sm text-[var(--ink)]/70">
            Découvrez les meilleures promotions du moment. Faites glisser
            pour voir toutes les offres.
          </p>
        </div>

<Link
  href="/offres"
  className="hidden items-center gap-2 border-b border-[var(--forest)]/30 pb-1 text-sm font-semibold text-[var(--forest)] transition hover:border-[var(--forest)] md:flex"
>
  Toutes les offres
  <ArrowRight size={16} />
</Link>
      </div>

      <PromotionsCarousel products={promotionalProducts} />
    </div>
  </section>
)}

      {/* =====================================================
          BEST SELLERS
      ===================================================== */}

      <section className="bg-[var(--forest)] px-6 py-20 md:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow index="02" label="Sélection" tone="paper" />
              <h2 className="font-display mt-4 text-4xl font-medium text-[var(--paper)] md:text-5xl">
                Les incontournables
              </h2>
            </div>

            <Link
              href="/shop"
              className="hidden items-center gap-2 border-b border-[var(--paper)]/25 pb-1 text-sm font-semibold text-[var(--paper)] transition hover:border-[var(--paper)]/60 md:flex"
            >
              Voir la boutique
              <ArrowRight size={16} />
            </Link>
          </div>

          {bestSellers.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {bestSellers.map((product, index) => (
                <div key={product._id} className="relative">
                  {index < 3 && (
                    <div className="absolute left-3 top-3 z-20 border border-[var(--gold)]/50 bg-[var(--forest)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--gold)]">
                      Rang {String(index + 1).padStart(2, "0")}
                    </div>
                  )}

                  <ProductCard
                    _id={product._id}
                    name={product.name}
                    price={product.price}
                    discountPrice={product.discountPrice}
                    image={product.images?.[0] ?? ""}
                    stock={product.stock}
                    brand={product.brand?.name}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-[var(--line-dark)] p-12 text-center">
              <p className="text-sm text-[var(--paper)]/60">
                Les meilleures ventes apparaîtront bientôt.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          BRANDS
      ===================================================== */}

      <section className="relative overflow-hidden bg-[var(--forest-soft)] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Eyebrow index="04" label="Maisons partenaires" tone="paper" />
          <h2 className="font-display mt-4 text-4xl font-medium text-[var(--paper)] md:text-5xl">
            Nos marques
          </h2>
        </div>

        {visibleBrands.length > 0 ? (
          <div className="pause-on-hover mt-12 overflow-hidden border-y border-[var(--line-dark)]">
            <div className="animate-marquee flex w-max gap-px">
              {[...visibleBrands, ...visibleBrands].map((brand, index) => (
                <Link
                  key={`${brand._id}-${index}`}
                  href={`/shop?brand=${brand._id}`}
                  className="flex h-28 w-48 shrink-0 items-center justify-center border-x border-[var(--line-dark)] bg-[var(--forest-soft)] px-6 grayscale transition duration-300 hover:grayscale-0"
                >
                  <BrandCard name={brand.name} />
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto mt-12 max-w-xl px-6 text-center">
            <p className="text-sm text-[var(--paper)]/50">
              Nos marques seront bientôt disponibles.
            </p>
          </div>
        )}
      </section>

      {/* =====================================================
          WHY FAIRY'S
      ===================================================== */}

      <section className="bg-[var(--paper)] px-6 py-24 md:px-16">
        <div className="mx-auto max-w-6xl">
          <Eyebrow index="05" label="Engagements" />
          <h2 className="font-display mt-4 max-w-lg text-4xl font-medium text-[var(--forest)] md:text-5xl">
            Pourquoi Fairy&apos;s ?
          </h2>

          <div className="mt-14 grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)] md:grid-cols-3">
            {values.map(({ icon: Icon, title, text }, index) => (
              <div key={title} className="bg-[var(--paper)] p-9">
                <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--clay)]">
                  Article {String(index + 1).padStart(2, "0")}
                </div>

                <div className="mt-6 flex h-12 w-12 items-center justify-center border border-[var(--forest)]/25 text-[var(--forest)]">
                  <Icon size={22} strokeWidth={1.6} />
                </div>

                <h3 className="font-display mt-6 text-xl font-medium text-[var(--forest)]">
                  {title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[var(--ink)]/60">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          NEWSLETTER / FINAL CTA
      ===================================================== */}

      <section className="relative overflow-hidden bg-[var(--forest)] px-6 py-24 md:px-16">
        <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-[var(--gold)]/10 blur-3xl" />



<section className="relative overflow-hidden bg-[var(--forest)] px-6 py-24 md:px-16">
  <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-2">

    {/* Contact Infos */}
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--gold)]">
        Contact
      </p>

      <h2 className="font-display mt-4 text-4xl font-medium text-[var(--paper)] md:text-5xl">
        Nous contacter
      </h2>

      <p className="mt-5 max-w-md text-sm leading-7 text-[var(--paper)]/65">
        Une question concernant un produit, une commande ou une
        livraison ? Notre équipe est à votre disposition.
      </p>

      <div className="mt-12 space-y-8">

        <div className="flex gap-4">
          <MapPin
            size={24}
            className="text-[var(--gold)]"
          />

          <div>
            <h3 className="font-semibold text-[var(--paper)]">
              Adresse
            </h3>

            <p className="mt-1 text-sm text-[var(--paper)]/60">
              Ariana, Tunisie
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <Clock3
            size={24}
            className="text-[var(--gold)]"
          />

          <div>
            <h3 className="font-semibold text-[var(--paper)]">
              Horaires
            </h3>

            <p className="mt-1 text-sm text-[var(--paper)]/60">
              Ouvert 24h/24
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <Mail
            size={24}
            className="text-[var(--gold)]"
          />

          <div>
            <h3 className="font-semibold text-[var(--paper)]">
              E-mail
            </h3>

            <p className="mt-1 text-sm text-[var(--paper)]/60">
              contact@fairys.tn
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <Phone
            size={24}
            className="text-[var(--gold)]"
          />

          <div>
            <h3 className="font-semibold text-[var(--paper)]">
              Téléphone
            </h3>

            <p className="mt-1 text-sm text-[var(--paper)]/60">
              23 203 203
            </p>
          </div>
        </div>

      </div>
    </div>

    {/* Contact Form */}
    <div className="rounded-2xl border border-[var(--line-dark)] p-8 md:p-10">
  <h3 className="font-display text-2xl text-[var(--paper)]">
    Une question ?
  </h3>

  <p className="mt-2 text-sm text-[var(--paper)]/50">
    Nous vous répondrons dans les plus brefs délais.
  </p>

  <div className="mt-8">
    <ContactForm />
  </div>
</div>

  </div>
</section>
      </section>
    </main>
  );
}