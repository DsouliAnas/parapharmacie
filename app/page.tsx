import Image from "next/image";
import { Leaf, Truck, Sparkles, ArrowRight } from "lucide-react";

import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import BrandCard from "@/components/BrandCard";
import Button from "@/components/Button";

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  stock: number;
}

async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/products`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json();
}

const brands = [
  "La Roche Posay",
  "Bioderma",
  "Avène",
  "Vichy",
  "Caudalie",
  "L'Occitane",
];

const categories = [
  { name: "Visage", image: "https://via.placeholder.com/300" },
  { name: "Cheveux", image: "https://via.placeholder.com/300" },
  { name: "Corps", image: "https://via.placeholder.com/300" },
  { name: "Bébé", image: "https://via.placeholder.com/300" },
  { name: "Compléments", image: "https://via.placeholder.com/300" },
  { name: "Solaire", image: "https://via.placeholder.com/300" },
];

const values = [
  {
    icon: Leaf,
    title: "Produits authentiques",
    text: "Des marques fiables et reconnues, sélectionnées avec soin.",
  },
  {
    icon: Truck,
    title: "Livraison rapide",
    text: "Recevez vos commandes en toute simplicité, où que vous soyez.",
  },
  {
    icon: Sparkles,
    title: "Conseils beauté",
    text: "Des recommandations adaptées à votre peau et vos besoins.",
  },
];

// Scatter positions for the hero's background product-image collage.
// Kept purely visual — top/left are percentages, r is a rotation in degrees.
const collagePositions = [
  { top: "6%", left: "4%", size: 150, r: -8, delay: "0s" },
  { top: "58%", left: "2%", size: 120, r: 6, delay: "1.2s" },
  { top: "12%", left: "82%", size: 170, r: 10, delay: "0.6s" },
  { top: "64%", left: "86%", size: 130, r: -6, delay: "1.8s" },
  { top: "2%", left: "42%", size: 100, r: 4, delay: "2.4s" },
  { top: "74%", left: "46%", size: 110, r: -10, delay: "0.3s" },
  { top: "34%", left: "10%", size: 90, r: 12, delay: "1.5s" },
  { top: "40%", left: "90%", size: 95, r: -4, delay: "0.9s" },
];

export default async function Home() {
  const products = await getProducts();
  const collageImages = products
    .map((p) => p.images?.[0])
    .filter((src): src is string => Boolean(src))
    .slice(0, collagePositions.length);

  return (
    <main className="bg-[var(--cream)]">
      {/* HERO */}
      <section className="relative isolate overflow-hidden px-6 pt-24 pb-20 md:px-16 md:pt-32 md:pb-28">
        {/* Product-photo collage, blurred and faded into the background */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {collageImages.map((src, i) => {
            const pos = collagePositions[i];
            return (
              <div
                key={src + i}
                className="animate-float absolute overflow-hidden rounded-[2rem] opacity-[0.16] blur-[1px] grayscale-[15%]"
                style={{
                  top: pos.top,
                  left: pos.left,
                  width: pos.size,
                  height: pos.size,
                  // @ts-expect-error -- custom property for rotation offset
                  "--r": `${pos.r}deg`,
                  transform: `rotate(${pos.r}deg)`,
                  animationDelay: pos.delay,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            );
          })}
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--cream)]/40 via-[var(--cream)]/75 to-[var(--cream)]" />
          <div
            className="absolute h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 bg-[var(--blush)]/25 blur-3xl"
            style={{ top: "35%", left: "50%", borderRadius: "62% 38% 30% 70% / 60% 30% 70% 40%" }}
          />
        </div>

        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
          <span className="rounded-full border border-[var(--sage)]/25 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--sage-dark)] shadow-sm backdrop-blur">
            Parapharmacie en ligne
          </span>

          <div className="mt-8 rounded-[2rem] border border-white/60 bg-white/50 px-8 py-10 shadow-[0_8px_40px_-12px_rgba(79,91,71,0.25)] backdrop-blur-md md:px-14 md:py-14">
            <Image
              src="/logo1.jpeg"
              width={100}
              height={100}
              alt="Fairy's"
              priority
              className="mx-auto rounded-full border-4 border-white shadow-lg"
            />

            <h1 className="font-display mt-6 text-4xl font-medium leading-[1.1] text-[var(--sage-dark)] md:text-6xl">
              Votre beauté,
              <br />
              <span className="italic text-[var(--sage)]">votre bien-être</span>
            </h1>

            <p className="mx-auto mt-6 max-w-md text-lg text-[var(--ink)]/70">
              Découvrez nos produits santé et beauté, sélectionnés avec soin
              pour prendre soin de vous, chaque jour.
            </p>

            <div className="mt-9 flex justify-center">
              <Button>Découvrir nos offres</Button>
            </div>
          </div>
        </div>

        {/* Signature scalloped divider */}
        <svg
          className="absolute inset-x-0 bottom-0 h-6 w-full text-[var(--sage)]/15"
          viewBox="0 0 240 12"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0,12 C10,0 20,0 30,12 C40,0 50,0 60,12 C70,0 80,0 90,12 C100,0 110,0 120,12 C130,0 140,0 150,12 C160,0 170,0 180,12 C190,0 200,0 210,12 C220,0 230,0 240,12 L240,12 L0,12 Z"
            fill="currentColor"
          />
        </svg>
      </section>

      {/* PROMO */}
      <section className="bg-[var(--sage)]/8 px-6 py-16 md:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-baseline justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--sage)]">
                Offres du moment
              </span>
              <h2 className="font-display mt-2 text-3xl font-medium text-[var(--sage-dark)] md:text-4xl">
                Fairys Promo
              </h2>
            </div>
            <a
              href="/shop"
              className="hidden items-center gap-1 text-sm font-semibold text-[var(--sage-dark)] transition hover:gap-2 md:flex"
            >
              Voir tout <ArrowRight size={16} />
            </a>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {products.slice(0, 3).map((product) => (
              <div
                key={product._id}
                className="transition duration-300 hover:-translate-y-1"
              >
                <ProductCard
                  _id={product._id}
                  name={product.name}
                  price={product.price}
                  image={product.images?.[0] || "https://via.placeholder.com/400"}
                  stock={product.stock > 0}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="px-6 py-20 md:px-16">
        <div className="mx-auto max-w-6xl">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--sage)]">
            Sélection populaire
          </span>
          <h2 className="font-display mt-2 mb-10 text-3xl font-medium text-[var(--sage-dark)] md:text-4xl">
            Meilleures ventes
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {products.map((product) => (
              <div
                key={product._id}
                className="transition duration-300 hover:-translate-y-1"
              >
                <ProductCard
                  _id={product._id}
                  name={product.name}
                  price={product.price}
                  image={product.images?.[0] || "https://via.placeholder.com/400"}
                  stock={product.stock > 0}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="relative overflow-hidden px-6 py-20 md:px-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display mb-10 text-3xl font-medium text-[var(--sage-dark)] md:text-4xl">
            Nos catégories
          </h2>

          <div className="grid grid-cols-2 gap-5 md:grid-cols-6">
            {categories.map((category) => (
              <div
                key={category.name}
                className="rounded-2xl transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <CategoryCard {...category} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BRANDS — infinite scrolling strip */}
      <section className="overflow-hidden bg-white py-16">
        <h2 className="font-display mb-10 px-6 text-center text-3xl font-medium text-[var(--sage-dark)] md:px-16 md:text-4xl">
          Nos marques populaires
        </h2>

        <div className="pause-on-hover overflow-hidden">
          <div className="animate-marquee flex w-max gap-14">
            {[...brands, ...brands].map((brand, i) => (
              <div key={brand + i} className="flex w-40 shrink-0 items-center justify-center">
                <BrandCard name={brand} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY FAIRY'S */}
      <section className="bg-[var(--cream)] px-6 py-20 md:px-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-center text-3xl font-medium text-[var(--sage-dark)] md:text-4xl">
            Pourquoi Fairy&apos;s ?
          </h2>

          <div className="mt-14 grid gap-10 text-center md:grid-cols-3">
            {values.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="flex flex-col items-center rounded-2xl bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--sage)]/10 text-[var(--sage-dark)]">
                  <Icon size={24} strokeWidth={1.75} />
                </div>
                <h3 className="font-display mt-5 text-lg font-medium text-[var(--sage-dark)]">
                  {title}
                </h3>
                <p className="mt-2 max-w-xs text-sm text-[var(--ink)]/65">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="relative overflow-hidden bg-[var(--sage-dark)] px-6 py-20 text-center md:px-16">
        <div
          className="pointer-events-none absolute h-[300px] w-[300px] -translate-x-1/2 bg-[var(--gold)]/10 blur-3xl"
          style={{ top: "-40%", left: "50%", borderRadius: "50%" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-md">
          <h2 className="font-display text-3xl font-medium text-white md:text-4xl">
            Recevez nos offres
          </h2>
          <p className="mt-3 text-sm text-white/70">
            Promotions exclusives et conseils beauté, directement dans votre
            boîte mail.
          </p>

          <form className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <input
              type="email"
              required
              className="input !mb-0 flex-1 border-none bg-white text-[var(--ink)]"
              placeholder="Votre email"
            />
            <button
              type="submit"
              className="w-full shrink-0 rounded-full bg-[var(--gold)] px-7 py-3 text-sm font-semibold text-[var(--sage-dark)] transition hover:brightness-95 sm:w-auto"
            >
              S&apos;inscrire
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}