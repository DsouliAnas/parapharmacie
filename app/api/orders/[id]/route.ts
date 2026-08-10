import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET ONE ORDER
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await context.params;

    const order = await Order.findOne({
      _id: id,
      user: session.user.id, // security: only own orders
    }).populate("products.product");

    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    return Response.json(order);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to get order" }, { status: 500 });
  }
}

// UPDATE ORDER STATUS
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    const order = await Order.findOneAndUpdate(
      { _id: id, user: session.user.id },
      { status: body.status },
      { new: true }
    );

    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    return Response.json(order);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to update order" }, { status: 500 });
  }
}

// DELETE ORDER
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await context.params;

    const order = await Order.findOneAndDelete({
      _id: id,
      user: session.user.id,
    });

    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    return Response.json({ message: "Order deleted" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Delete failed" }, { status: 500 });
  }
}