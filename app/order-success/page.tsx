"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Order {
  _id: string;
  orderNumber?: string;
}

interface ErrorResponse {
  error?: string;
}

function OrderSuccessContent(): React.ReactElement {
  const searchParams = useSearchParams();

  const id = searchParams.get("id");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder(): Promise<void> {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/orders/${id}`, {
          method: "GET",
          cache: "no-store",
        });

        const data: unknown = await response.json();
console.log("ORDER SUCCESS API DATA:", data);

        if (!response.ok) {
          const errorData = data as ErrorResponse;

          throw new Error(
            errorData.error ||
              "Impossible de récupérer la commande."
          );
        }

        setOrder(data as Order);
      } catch (error) {
        console.error(
          "GET ORDER SUCCESS ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Impossible de récupérer la commande."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadOrder();
  }, [id]);

  if (!id) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F3EA] px-6 py-16">
        <div className="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl">
            !
          </div>

          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Commande introuvable
          </h1>

          <p className="mt-3 text-gray-500">
            Nous ne pouvons pas trouver cette commande.
          </p>

          <Link
            href="/shop"
            className="mt-8 inline-flex rounded-full bg-[#7C8B73] px-7 py-3 font-semibold text-white transition hover:bg-[#66745F]"
          >
            Retour à la boutique
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F3EA] px-6 py-16">
        <div className="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F8F3EA] text-3xl text-[#7C8B73]">
            ✓
          </div>

          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            Chargement de votre commande...
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            Veuillez patienter un instant.
          </p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F3EA] px-6 py-16">
        <div className="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl">
            !
          </div>

          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Commande introuvable
          </h1>

          <p className="mt-3 text-gray-500">
            Nous ne pouvons pas récupérer les informations de cette commande.
          </p>

          <Link
            href="/shop"
            className="mt-8 inline-flex rounded-full bg-[#7C8B73] px-7 py-3 font-semibold text-white transition hover:bg-[#66745F]"
          >
            Retour à la boutique
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F3EA] px-6 py-16">
      <div className="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#F8F3EA] text-4xl">
          ✓
        </div>

        <h1 className="mt-6 text-3xl font-bold text-[#7C8B73]">
          Commande confirmée 🎉
        </h1>

        <p className="mt-4 text-lg text-gray-700">
          Merci pour votre commande !
        </p>

        <p className="mt-3 text-sm text-gray-500">
          Votre commande a bien été enregistrée.
        </p>

        <div className="mt-7 rounded-2xl bg-[#F8F3EA] p-5">
          <p className="text-sm text-gray-500">
            Numéro de commande
          </p>

          <p className="mt-2 break-all text-lg font-bold tracking-wide text-gray-900">
            {order.orderNumber ?? "Commande confirmée"}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href={`/orders/${order._id}`}
            className="inline-flex w-full items-center justify-center rounded-full bg-[#7C8B73] px-7 py-3 font-semibold text-white transition hover:bg-[#66745F]"
          >
            Voir ma commande
          </Link>

          <Link
            href="/shop"
            className="inline-flex w-full items-center justify-center rounded-full border border-[#7C8B73] px-7 py-3 font-medium text-[#7C8B73] transition hover:bg-[#F8F3EA]"
          >
            Continuer mes achats
          </Link>

          <Link
            href="/"
            className="mt-1 text-sm text-gray-500 transition hover:text-[#7C8B73]"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#F8F3EA] px-6 py-16">
          <div className="text-center">
            <p className="text-gray-500">
              Chargement...
            </p>
          </div>
        </main>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}