import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import PrintBonButton from "@/components/PrintBonButton";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import "@/models/Product";

interface Product {
  _id: string;
  name: string;
  images: string[];
}

interface OrderProduct {
  product: Product | null;
  quantity: number;
  price: number;
}

interface OrderType {
  _id: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  backupPhone?: string;
  address: string;
  totalPrice: number;
  status:
    | "Pending"
    | "Processing"
    | "Shipped"
    | "Delivered"
    | "Cancelled";
  paymentMethod: string;
  products: OrderProduct[];
  createdAt: string;
}

async function getOrder(id: string): Promise<OrderType | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  await connectDB();

  const order = await Order.findOne({
    _id: id,
    user: session.user.id,
  })
    .populate({
      path: "products.product",
      select: "name images",
    })
    .lean();

  if (!order) {
    return null;
  }

  return JSON.parse(JSON.stringify(order)) as OrderType;
}

function getStatusLabel(status: OrderType["status"]): string {
  switch (status) {
    case "Pending":
      return "En attente";

    case "Processing":
      return "En préparation";

    case "Shipped":
      return "Expédiée";

    case "Delivered":
      return "Livrée";

    case "Cancelled":
      return "Annulée";

    default:
      return status;
  }
}

function getStatusClass(status: OrderType["status"]): string {
  switch (status) {
    case "Delivered":
      return "bg-green-100 text-green-700";

    case "Cancelled":
      return "bg-red-100 text-red-700";

    case "Shipped":
      return "bg-blue-100 text-blue-700";

    case "Processing":
      return "bg-orange-100 text-orange-700";

    case "Pending":
    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await getOrder(id);

  if (!order) {
    return (
      <main className="min-h-screen bg-[#F8F3EA] px-5 py-10 md:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl">
              !
            </div>

            <h1 className="mt-5 text-2xl font-bold text-gray-900">
              Commande introuvable
            </h1>

            <p className="mt-2 text-gray-500">
              Cette commande n&apos;existe pas ou vous n&apos;avez pas accès à
              cette commande.
            </p>

            <Link
              href="/orders"
              className="mt-6 inline-block rounded-full bg-[#7C8B73] px-6 py-3 font-semibold text-white transition hover:bg-[#66745F]"
            >
              Retour à mes commandes
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const subtotal = order.products.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const deliveryFee = Math.max(order.totalPrice - subtotal, 0);

  return (
    <main className="min-h-screen bg-[#F8F3EA] px-5 py-10 md:px-10">
      <div className="mx-auto max-w-5xl">
        {/* Back button */}
        <Link
          href="/orders"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#7C8B73] transition hover:gap-3"
        >
          ← Retour aux commandes
        </Link>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#7C8B73]">
              Détails de la commande
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#3F493A] md:text-4xl">
              Commande #{order._id.slice(-6).toUpperCase()}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleDateString("fr-TN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${getStatusClass(
              order.status
            )}`}
          >
            {getStatusLabel(order.status)}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main receipt */}
          <div className="space-y-6 lg:col-span-2">
            {/* Products */}
            <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-bold text-gray-900">
                Produits commandés
              </h2>

              <div className="mt-6 divide-y divide-gray-100">
                {order.products.map((item, index) => {
                  const product = item.product;

                  return (
                    <div
                      key={`${product?._id ?? "product"}-${index}`}
                      className="flex gap-4 py-5 first:pt-0 last:pb-0"
                    >
                      {/* Product image */}
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        {product?.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-gray-400">
                            Pas d&apos;image
                          </div>
                        )}
                      </div>

                      {/* Product information */}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {product?.name ?? "Produit indisponible"}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Quantité : {item.quantity}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {item.price.toFixed(2)} TND / unité
                        </p>
                      </div>

                      {/* Product total */}
                      <div className="shrink-0 text-right">
                        <p className="font-semibold text-[#7C8B73]">
                          {(item.price * item.quantity).toFixed(2)} TND
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Customer information */}
            <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-bold text-gray-900">
                Informations de livraison
              </h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Nom
                  </p>
                  <p className="mt-1 text-gray-800">
                    {order.customerName}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Email
                  </p>
                  <p className="mt-1 break-all text-gray-800">
                    {order.customerEmail}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Téléphone
                  </p>
                  <p className="mt-1 text-gray-800">
                    {order.phone}
                  </p>
                </div>

                {order.backupPhone && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Téléphone secondaire
                    </p>
                    <p className="mt-1 text-gray-800">
                      {order.backupPhone}
                    </p>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Adresse
                  </p>
                  <p className="mt-1 text-gray-800">
                    {order.address}
                  </p>
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-bold text-gray-900">
                Paiement
              </h2>

              <div className="mt-5 flex items-center justify-between rounded-xl bg-[#F8F3EA] p-4">
                <span className="text-gray-600">
                  Méthode de paiement
                </span>

                <span className="font-semibold text-gray-900">
                  {order.paymentMethod}
                </span>
              </div>
            </section>
          </div>

          {/* Summary */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6 rounded-2xl bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-bold text-gray-900">
                Résumé
              </h2>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    Sous-total
                  </span>

                  <span className="font-medium text-gray-900">
                    {subtotal.toFixed(2)} TND
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    Livraison
                  </span>

                  <span className="font-medium text-gray-900">
                    {deliveryFee.toFixed(2)} TND
                  </span>
                </div>
              </div>

              <div className="my-6 border-t border-gray-100" />

              <div className="flex items-end justify-between gap-4">
                <span className="text-lg font-semibold text-gray-900">
                  Total
                </span>

                <span className="text-2xl font-bold text-[#7C8B73]">
                  {order.totalPrice.toFixed(2)} TND
                </span>
              </div>

              <div className="mt-6 rounded-xl bg-[#F8F3EA] p-4 text-center">
                <p className="text-xs text-gray-500">
                  Paiement à la livraison
                </p>

                <p className="mt-1 text-sm font-semibold text-[#3F493A]">
                  {order.paymentMethod}
                </p>
              </div>

              <Link
                href="/orders"
                className="mt-6 block w-full rounded-full border border-[#7C8B73] px-5 py-3 text-center text-sm font-semibold text-[#7C8B73] transition hover:bg-[#7C8B73] hover:text-white"
              >
                Toutes mes commandes
              </Link>

              <div className="mt-6 block w-full rounded-full border border-[#7C8B73] px-5 py-3 text-center text-sm font-semibold text-[#7C8B73] transition hover:bg-[#7C8B73] hover:text-white">
                <PrintBonButton order={order} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
