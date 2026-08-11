"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface CheckoutForm {
  name: string;
  email: string;
  phone: string;
  backupPhone: string;
  address: string;
}

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();

  const {
    data: session,
    status,
  } = useSession();

  const [form, setForm] =
    useState<CheckoutForm>({
      name: "",
      email: "",
      phone: "",
      backupPhone: "",
      address: "",
    });

  const [loading, setLoading] =
    useState(false);

  const deliveryFee =
    cart.length > 0 ? 7 : 0;

  const subtotal = cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  const total = subtotal + deliveryFee;

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function placeOrder() {
    if (status === "unauthenticated") {
      alert(
        "Veuillez vous connecter pour passer commande"
      );

      router.push("/login");
      return;
    }

    if (status !== "authenticated") {
      return;
    }

    if (cart.length === 0) {
      alert("Votre panier est vide");
      return;
    }

    const customerName =
      form.name.trim() ||
      session.user?.name?.trim() ||
      "";

    const customerEmail =
      form.email.trim() ||
      session.user?.email?.trim() ||
      "";

    const phone = form.phone.trim();
    const backupPhone =
      form.backupPhone.trim();
    const address = form.address.trim();

    if (
      !customerName ||
      !phone ||
      !address
    ) {
      alert(
        "Veuillez remplir les champs obligatoires"
      );

      return;
    }

    setLoading(true);

    const orderData = {
      customerName,
      customerEmail,
      phone,
      backupPhone,
      address,
      products: cart.map((item) => ({
        product: item._id,
        quantity: item.quantity,
        price: item.price,
      })),
      totalPrice: total,
      paymentMethod: "Cash on Delivery",
      status: "Pending",
    };

    try {
      const response = await fetch(
        "/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(orderData),
        }
      );

      const data: unknown =
        await response.json().catch(
          () => null
        );

      if (response.ok) {
        if (
          typeof data === "object" &&
          data !== null &&
          "_id" in data &&
          typeof data._id === "string"
        ) {
          clearCart();

          router.push(
            `/order-success?id=${data._id}`
          );

          return;
        }

        alert(
          "Commande créée mais la réponse est invalide."
        );

        return;
      }

      if (response.status === 401) {
        alert(
          "Vous devez être connecté pour passer une commande"
        );

        router.push("/login");
        return;
      }

      if (
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof data.error === "string"
      ) {
        alert(data.error);
      } else {
        alert(
          "Erreur lors de la commande"
        );
      }
    } catch (error) {
      console.error(
        "ORDER ERROR:",
        error
      );

      alert(
        "Erreur réseau. Réessayez."
      );
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F3EA]">
        <p className="text-gray-500">
          Chargement...
        </p>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#F8F3EA] px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <h1 className="text-3xl font-bold text-gray-900">
              Votre panier est vide
            </h1>

            <p className="mt-3 text-gray-500">
              Ajoutez des produits avant de
              passer votre commande.
            </p>

            <Link
              href="/shop"
              className="mt-6 inline-block rounded-full bg-[#7C8B73] px-7 py-3 font-medium text-white transition hover:bg-[#66745F]"
            >
              Voir les produits
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const displayedName =
    form.name ||
    session?.user?.name ||
    "";

  const displayedEmail =
    form.email ||
    session?.user?.email ||
    "";

  return (
    <main className="min-h-screen bg-[#F8F3EA] px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold text-[#7C8B73]">
          Finaliser votre commande
        </h1>

        <div className="mt-10 grid gap-10 md:grid-cols-2">
          {/* FORM */}
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              Informations livraison
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Nom <span className="text-red-500">*</span>
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Votre nom"
                  value={displayedName}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Votre email"
                  value={displayedEmail}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Téléphone{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Votre numéro de téléphone"
                  value={form.phone}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="backupPhone"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Téléphone secondaire
                </label>

                <input
                  id="backupPhone"
                  name="backupPhone"
                  type="tel"
                  placeholder="Numéro secondaire"
                  value={form.backupPhone}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Adresse{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Votre adresse"
                  value={form.address}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </div>
          </div>

          {/* SUMMARY */}
          <div className="h-fit rounded-2xl bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              Résumé
            </h2>

            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between gap-4 text-sm"
                >
                  <span className="text-gray-600">
                    {item.name} ×{" "}
                    {item.quantity}
                  </span>

                  <span className="font-medium">
                    {(
                      item.price *
                      item.quantity
                    ).toFixed(2)}{" "}
                    TND
                  </span>
                </div>
              ))}
            </div>

            <hr className="my-6" />

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Sous-total
                </span>

                <span>
                  {subtotal.toFixed(2)} TND
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Livraison
                </span>

                <span>
                  {deliveryFee.toFixed(2)} TND
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

            <div className="mt-6 rounded-xl bg-[#F8F3EA] p-4">
              <p className="text-sm font-medium text-gray-800">
                Mode de paiement
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Paiement à la livraison
              </p>
            </div>

            <button
              type="button"
              onClick={placeOrder}
              disabled={
                loading ||
                status !== "authenticated"
              }
              className="mt-8 w-full rounded-full bg-[#7C8B73] py-3 font-semibold text-white transition hover:bg-[#66745F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Traitement..."
                : status !== "authenticated"
                ? "Connectez-vous pour commander"
                : "Commander"}
            </button>

            {status ===
              "unauthenticated" && (
              <p className="mt-3 text-center text-sm text-red-600">
                Vous devez être connecté
                pour passer une commande.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}