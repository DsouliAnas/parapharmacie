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
  product: Product;
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
  status: string;
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
    .populate("products.product")
    .lean();

  if (!order) return null;

  return JSON.parse(JSON.stringify(order));
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
      <main className="min-h-screen bg-[#F8F3EA] p-10">
        <h1 className="text-2xl font-bold">Commande introuvable</h1>
        <Link href="/orders" className="text-blue-600 underline mt-4 inline-block">
          ← Retour aux commandes
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F3EA] p-10">
      <div className="mb-6">
        <Link href="/orders" className="text-sm text-gray-600 hover:underline">
          ← Retour aux commandes
        </Link>
      </div>

      <h1 className="text-4xl font-bold mb-8">
        Commande #{order._id.slice(-6)}
      </h1>

      <div className="bg-white p-8 rounded-xl shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p>
            <strong>Nom :</strong> {order.customerName}
          </p>
          <p>
            <strong>Email :</strong> {order.customerEmail}
          </p>
          <p>
            <strong>Téléphone :</strong> {order.phone}
          </p>
          {order.backupPhone && (
            <p>
              <strong>Téléphone de secours :</strong> {order.backupPhone}
            </p>
          )}
          <p className="md:col-span-2">
            <strong>Adresse :</strong> {order.address}
          </p>
          <p>
            <strong>Paiement :</strong> {order.paymentMethod}
          </p>
          <p>
            <strong>Statut :</strong>{" "}
            <span
              className={
                order.status === "Delivered"
                  ? "text-green-600"
                  : order.status === "Cancelled"
                  ? "text-red-600"
                  : "text-orange-600"
              }
            >
              {order.status}
            </span>
          </p>
        </div>

        <hr className="my-6" />

        <h2 className="text-xl font-semibold mb-4">Produits</h2>
        <div className="space-y-3">
          {order.products.map((item) => (
            <div
              key={item.product._id}
              className="flex justify-between items-center"
            >
              <span>
                {item.product.name} × {item.quantity}
              </span>
              <span className="font-medium">
                {item.price * item.quantity} TND
              </span>
            </div>
          ))}
        </div>

        <hr className="my-6" />

        <div className="text-right">
          <h2 className="text-2xl font-bold">
            Total : {order.totalPrice} TND
          </h2>
        </div>
      </div>
    </main>
  );
}