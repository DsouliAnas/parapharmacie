import { cookies } from "next/headers";

import OrderManager, {
  Order,
} from "@/components/orders/OrderManager";

export const dynamic = "force-dynamic";

export const revalidate = 0;

async function getOrders(): Promise<Order[]> {
  const cookieStore = await cookies();

  const baseUrl =
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000";

  const response = await fetch(
    `${baseUrl}/api/orders`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Cookie: cookieStore.toString(),
      },
    }
  );

  if (!response.ok) {
    console.error(
      "GET ADMIN ORDERS ERROR:",
      response.status
    );

    throw new Error(
      "Failed to fetch orders"
    );
  }

  const data =
    (await response.json()) as Order[];

  return data;
}

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <main className="min-h-screen bg-[#F8F3EA] p-4 sm:p-6 lg:p-10">
      <OrderManager
        orders={orders}
      />
    </main>
  );
}