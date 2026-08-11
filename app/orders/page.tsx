import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

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
  totalPrice: number;
  status:
    | "Pending"
    | "Processing"
    | "Shipped"
    | "Delivered"
    | "Cancelled";
  createdAt: string;
  products: OrderProduct[];
}

async function getOrders(): Promise<OrderType[]> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  await connectDB();

  const orders = await Order.find({
    user: session.user.id,
  })
    .populate({
      path: "products.product",
      select: "name images",
    })
    .sort({
      createdAt: -1,
    })
    .lean();

  return JSON.parse(JSON.stringify(orders)) as OrderType[];
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

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <main className="min-h-screen bg-[#F8F3EA] px-5 py-10 md:px-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#7C8B73]">
            Mon compte
          </p>

          <h1 className="mt-2 text-4xl font-bold text-[#3F493A]">
            Mes commandes
          </h1>

          <p className="mt-2 text-gray-600">
            Retrouvez ici l&apos;historique de toutes vos commandes.
          </p>
        </div>

        {/* Empty state */}
        {orders.length === 0 ? (
          <div className="rounded-2xl bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#7C8B73]/10 text-3xl">
              🛍️
            </div>

            <h2 className="mt-5 text-2xl font-semibold text-gray-800">
              Aucune commande
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-500">
              Vous n&apos;avez pas encore passé de commande. Découvrez nos
              produits et trouvez vos favoris.
            </p>

            <Link
              href="/shop"
              className="mt-6 inline-block rounded-full bg-[#7C8B73] px-7 py-3 font-semibold text-white transition hover:bg-[#66745F]"
            >
              Découvrir la boutique
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const productCount = order.products.reduce(
                (total, item) => total + item.quantity,
                0
              );

              return (
                <Link
                  key={order._id}
                  href={`/orders/${order._id}`}
                  className="group block rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:p-6"
                >
                  {/* Order header */}
                  <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-bold text-gray-900">
                          Commande #{order._id.slice(-6).toUpperCase()}
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString(
                          "fr-TN",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-xl font-bold text-[#7C8B73]">
                        {order.totalPrice.toFixed(2)} TND
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {productCount}{" "}
                        {productCount > 1 ? "articles" : "article"}
                      </p>
                    </div>
                  </div>

                  {/* Products preview */}
                  <div className="mt-5 flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center">
                      <div className="flex -space-x-3">
                        {order.products
                          .slice(0, 4)
                          .map((item, index) => (
                            <div
                              key={`${order._id}-${item.product?._id ?? index}`}
                              className="h-14 w-14 overflow-hidden rounded-xl border-2 border-white bg-gray-100 shadow-sm"
                            >
                              {item.product?.images?.[0] ? (
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                                  —
                                </div>
                              )}
                            </div>
                          ))}
                      </div>

                      {order.products.length > 4 && (
                        <span className="ml-4 text-sm text-gray-500">
                          +{order.products.length - 4} autres
                        </span>
                      )}
                    </div>

                    <span className="shrink-0 text-sm font-semibold text-[#7C8B73] transition group-hover:translate-x-1">
                      Voir la commande →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}