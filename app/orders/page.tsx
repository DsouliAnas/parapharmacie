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
totalPrice: number;
status: string;
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
1
return JSON.parse(JSON.stringify(orders));
}
export default async function OrdersPage() {
const orders = await getOrders();
const ordersList = Array.isArray(orders)
? orders
: [];
return (
<main className="min-h-screen bg-[#F8F3EA] p-10">
<h1 className="text-4xl font-bold mb-8">
Mes commandes
</h1>
{ordersList.length === 0 ? (
<p className="text-gray-600">
Aucune commande pour le moment.
</p>
) : (
<div className="space-y-6">
{ordersList.map((order) => (
<Link
key={order._id}
href={`/orders/${order._id}`}
className="
 block
 bg-white
 p-6
 rounded-xl
 shadow
 hover:shadow-md
 transition
 "
>
<div className="flex justify-between items-start">
<div>
<h2 className="font-bold text-lg">
Commande #{order._id.slice(-6)}
</h2>
<p className="text-gray-500 text-sm mt-1">
{new Date(
order.createdAt
).toLocaleDateString("fr-TN", {
day: "2-digit",
month: "long",
year: "numeric",
})}
</p>
2
</div>
<div className="text-right">
<p className="font-bold text-lg">
{order.totalPrice} TND
</p>
<p
className={`text-sm mt-1 ${
order.status === "Delivered"
? "text-green-600"
: order.status === "Cancelled"
? "text-red-600"
: "text-orange-600"
}`}
>
{order.status}
</p>
</div>
</div>
</Link>
))}
</div>
)}
</main>
);
}
3