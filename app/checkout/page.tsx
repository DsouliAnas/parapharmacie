"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(false);

  // Start with empty form – we will use session values as fallback in the inputs
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    backupPhone: "",
    address: "",
  });

  const deliveryFee = 7;

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const total = subtotal + deliveryFee;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function placeOrder() {
    if (status === "unauthenticated") {
      alert("Veuillez vous connecter pour passer commande");
      router.push("/login");
      return;
    }

    // Use form values, or fall back to session if the user didn't type anything
    const customerName = form.name || session?.user?.name || "";
    const customerEmail = form.email || session?.user?.email || "";

    if (!customerName || !form.phone || !form.address) {
      alert("Veuillez remplir les champs obligatoires");
      return;
    }

    if (cart.length === 0) {
      alert("Votre panier est vide");
      return;
    }

    setLoading(true);

    const orderData = {
      customerName,
      customerEmail,
      phone: form.phone,
      backupPhone: form.backupPhone,
      address: form.address,
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
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();
        clearCart();
        router.push(`/order-success?id=${order._id}`);
      } else {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          alert("Vous devez être connecté pour passer commande");
          router.push("/login");
        } else {
          alert(errorData.error || "Erreur lors de la commande");
        }
      }
    } catch (error) {
      console.error(error);
      alert("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-[#F8F3EA] p-10 flex items-center justify-center">
        <p>Chargement...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F3EA] p-10">
      <h1 className="text-4xl font-bold text-[#7C8B73] mb-10">
        Finaliser votre commande
      </h1>

      <div className="grid md:grid-cols-2 gap-10">
        {/* FORM */}
        <div className="bg-white rounded-2xl p-8 shadow">
          <h2 className="text-2xl font-bold mb-5">Informations livraison</h2>

          <input
            name="name"
            placeholder="Nom *"
            value={form.name || session?.user?.name || ""}
            onChange={handleChange}
            className="input"
          />

          <input
            name="email"
            placeholder="Email"
            value={form.email || session?.user?.email || ""}
            onChange={handleChange}
            className="input"
          />

          <input
            name="phone"
            placeholder="Téléphone *"
            value={form.phone}
            onChange={handleChange}
            className="input"
          />

          <input
            name="backupPhone"
            placeholder="Téléphone secondaire"
            value={form.backupPhone}
            onChange={handleChange}
            className="input"
          />

          <input
            name="address"
            placeholder="Adresse *"
            value={form.address}
            onChange={handleChange}
            className="input"
          />
        </div>

        {/* SUMMARY */}
        <div className="bg-white rounded-2xl p-8 shadow">
          <h2 className="text-2xl font-bold mb-5">Résumé</h2>

          {cart.map((item) => (
            <div key={item._id} className="flex justify-between mb-3">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>{item.price * item.quantity} TND</span>
            </div>
          ))}

          <hr className="my-5" />

          <div className="flex justify-between">
            <span>Sous-total</span>
            <span>{subtotal} TND</span>
          </div>

          <div className="flex justify-between">
            <span>Livraison</span>
            <span>{deliveryFee} TND</span>
          </div>

          <div className="flex justify-between font-bold text-xl mt-5">
            <span>Total</span>
            <span>{total} TND</span>
          </div>

          <button
            onClick={placeOrder}
            disabled={loading || status === "unauthenticated"}
            className="mt-8 w-full bg-[#7C8B73] text-white py-3 rounded-full disabled:opacity-60"
          >
            {loading
              ? "Traitement..."
              : status === "unauthenticated"
              ? "Connectez-vous pour commander"
              : "Commander"}
          </button>

          {status === "unauthenticated" && (
            <p className="text-center text-sm text-red-600 mt-3">
              Vous devez être connecté pour passer une commande
            </p>
          )}
        </div>
      </div>
    </main>
  );
}