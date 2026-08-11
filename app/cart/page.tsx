"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus } from "lucide-react";
import { useCart } from "@/components/CartProvider";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  const delivery = cart.length > 0 ? 7 : 0;
  const total = subtotal + delivery;

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#F8F3EA] px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold text-[#7C8B73]">
            Mon panier
          </h1>

          <div className="mt-10 rounded-2xl bg-white p-12 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-800">
              Votre panier est vide
            </h2>

            <p className="mt-3 text-gray-500">
              Découvrez nos produits et ajoutez
              vos favoris à votre panier.
            </p>

            <Link
              href="/shop"
              className="mt-6 inline-block rounded-full bg-[#7C8B73] px-7 py-3 font-medium text-white transition hover:bg-[#66745F]"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F3EA] px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold text-[#7C8B73]">
          Mon panier
        </h1>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* CART ITEMS */}
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item._id}
                className="rounded-2xl bg-white p-5 shadow-sm"
              >
                <div className="flex gap-5">
                  {/* IMAGE */}
                  <Link
                    href={`/products/${item._id}`}
                    className="shrink-0"
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={110}
                        height={110}
                        className="h-[110px] w-[110px] rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-[110px] w-[110px] items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">
                        Pas d&apos;image
                      </div>
                    )}
                  </Link>

                  {/* INFO */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <Link
                        href={`/products/${item._id}`}
                        className="font-semibold text-gray-900 hover:text-[#7C8B73]"
                      >
                        {item.name}
                      </Link>

                      <p className="mt-2 font-medium text-[#7C8B73]">
                        {item.price.toFixed(2)} TND
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-4">
                      {/* QUANTITY */}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            decreaseQuantity(
                              item._id
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8F3EA] transition hover:bg-[#e9e1d5]"
                          aria-label="Diminuer la quantité"
                        >
                          <Minus size={15} />
                        </button>

                        <span className="min-w-[20px] text-center font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            increaseQuantity(
                              item._id
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7C8B73] text-white transition hover:bg-[#66745F]"
                          aria-label="Augmenter la quantité"
                        >
                          <Plus size={15} />
                        </button>
                      </div>

                      {/* REMOVE */}
                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(
                            item._id
                          )
                        }
                        className="flex items-center gap-2 text-sm text-red-500 transition hover:text-red-700"
                      >
                        <Trash2 size={16} />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SUMMARY */}
          <div className="h-fit rounded-2xl bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">
              Résumé
            </h2>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Sous-total
                </span>

                <span className="font-medium">
                  {subtotal.toFixed(2)} TND
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Livraison
                </span>

                <span className="font-medium">
                  {delivery.toFixed(2)} TND
                </span>
              </div>
            </div>

            <div className="my-6 border-t border-gray-200" />

            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>

              <span className="text-[#7C8B73]">
                {total.toFixed(2)} TND
              </span>
            </div>

            <Link
              href="/checkout"
              className="mt-7 flex w-full items-center justify-center rounded-full bg-[#7C8B73] px-8 py-3 font-semibold text-white transition hover:bg-[#66745F]"
            >
              Passer la commande
            </Link>

            <Link
              href="/shop"
              className="mt-3 flex w-full items-center justify-center rounded-full border border-[#7C8B73] px-8 py-3 text-sm font-medium text-[#7C8B73] transition hover:bg-[#F8F3EA]"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}