"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus } from "lucide-react";
import { useCart } from "@/components/CartProvider";

export default function CartPage() {
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity } =
    useCart();

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const delivery = cart.length > 0 ? 7 : 0;
  const total = subtotal + delivery;

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[var(--paper)] px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--forest)]">
            <span>N°08 — Panier</span>
            <span className="leader" />
          </div>

          <h1 className="font-display mt-4 text-4xl font-medium text-[var(--forest)]">
            Mon panier
          </h1>

          <div className="mt-10 border border-dashed border-[var(--line)] bg-[var(--paper-deep)] p-12 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--clay)]">
              Panier vide
            </p>

            <h2 className="font-display mt-3 text-2xl font-medium text-[var(--forest)]">
              Votre panier est vide
            </h2>

            <p className="mt-3 text-sm leading-6 text-[var(--ink)]/55">
              Découvrez nos produits et ajoutez vos favoris à votre panier.
            </p>

            <Link
              href="/shop"
              className="mt-7 inline-flex items-center gap-2 bg-[var(--forest)] px-7 py-3 text-sm font-semibold text-[var(--paper)] transition hover:bg-[var(--forest-soft)]"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--paper)] px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--forest)]">
          <span>N°08 — Panier</span>
          <span className="leader" />
        </div>

        <h1 className="font-display mt-4 text-4xl font-medium text-[var(--forest)]">
          Mon panier
        </h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* CART ITEMS — liste type "reçu" */}
          <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {cart.map((item) => (
              <div key={item._id} className="flex gap-5 py-6">
                {/* IMAGE */}
                <Link href={`/products/${item._id}`} className="shrink-0">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={110}
                      height={110}
                      className="h-[110px] w-[110px] border border-[var(--line)] object-cover"
                    />
                  ) : (
                    <div className="flex h-[110px] w-[110px] items-center justify-center border border-[var(--line)] bg-[var(--paper-deep)] text-[11px] uppercase tracking-[0.1em] text-[var(--ink)]/35">
                      Pas d&apos;image
                    </div>
                  )}
                </Link>

                {/* INFO */}
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <Link
                      href={`/products/${item._id}`}
                      className="font-display text-lg font-medium text-[var(--forest)] transition hover:text-[var(--clay)]"
                    >
                      {item.name}
                    </Link>

                    <p className="font-display mt-2 italic text-[var(--forest)]">
                      {item.price.toFixed(2)} TND
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                    {/* QUANTITY */}
                    <div className="flex items-center border border-[var(--line)]">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(item._id)}
                        className="flex h-9 w-9 items-center justify-center text-[var(--forest)] transition hover:bg-[var(--paper-deep)]"
                        aria-label="Diminuer la quantité"
                      >
                        <Minus size={14} />
                      </button>

                      <span className="min-w-[32px] border-x border-[var(--line)] py-2 text-center text-sm font-semibold text-[var(--forest)]">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => increaseQuantity(item._id)}
                        className="flex h-9 w-9 items-center justify-center text-[var(--forest)] transition hover:bg-[var(--paper-deep)]"
                        aria-label="Augmenter la quantité"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* REMOVE */}
                    <button
                      type="button"
                      onClick={() => removeFromCart(item._id)}
                      className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--clay)] transition hover:opacity-70"
                    >
                      <Trash2 size={15} />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SUMMARY — fiche de commande */}
          <div className="h-fit border border-[var(--line)] bg-[var(--paper-deep)] p-7">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--clay)]">
              Résumé de commande
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-baseline gap-2 text-[var(--ink)]/70">
                <span className="uppercase tracking-[0.08em]">
                  Sous-total
                </span>
                <span className="leader" />
                <span className="font-medium text-[var(--forest)]">
                  {subtotal.toFixed(2)} TND
                </span>
              </div>

              <div className="flex items-baseline gap-2 text-[var(--ink)]/70">
                <span className="uppercase tracking-[0.08em]">
                  Livraison
                </span>
                <span className="leader" />
                <span className="font-medium text-[var(--forest)]">
                  {delivery.toFixed(2)} TND
                </span>
              </div>
            </div>

            <div className="my-6 border-t border-[var(--line)]" />

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-[0.1em] text-[var(--forest)]">
                Total
              </span>

              <span className="font-display text-2xl italic text-[var(--forest)]">
                {total.toFixed(2)} TND
              </span>
            </div>

            <Link
              href="/checkout"
              className="mt-7 flex w-full items-center justify-center gap-2 bg-[var(--forest)] px-8 py-3.5 text-sm font-semibold text-[var(--paper)] transition hover:bg-[var(--forest-soft)]"
            >
              Passer la commande
            </Link>

            <Link
              href="/shop"
              className="mt-3 flex w-full items-center justify-center gap-2 border border-[var(--forest)]/30 px-8 py-3.5 text-sm font-semibold text-[var(--forest)] transition hover:border-[var(--forest)]"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}