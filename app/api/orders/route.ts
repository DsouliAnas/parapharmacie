import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// CREATE ORDER
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const order = await Order.create({
      ...body,
      user: session.user.id, // ← always attach the logged-in user
    });

    return Response.json(order, { status: 201 });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    return Response.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

// GET ALL ORDERS (only the logged-in user's orders)
export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const orders = await Order.find({ user: session.user.id })
      .populate({
        path: "products.product",
        select: "name images",
      })
      .sort({ createdAt: -1 });

    return Response.json(orders);
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    return Response.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}