import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import "@/models/Product";

import { authOptions } from "@/lib/auth";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// GET ONE ORDER
// A customer can only see their own order.
export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json(
        {
          error: "Not authenticated",
        },
        {
          status: 401,
        }
      );
    }

    const { id } = await context.params;

    const order = await Order.findOne({
      _id: id,
      user: session.user.id,
    }).populate({
      path: "products.product",
      select: "name images price discountPrice",
    });

    if (!order) {
      return Response.json(
        {
          error: "Order not found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(order);
  } catch (error) {
    console.error("GET ORDER ERROR:", error);

    return Response.json(
      {
        error: "Failed to get order",
      },
      {
        status: 500,
      }
    );
  }
}

// Customers should NOT be allowed to change order status.
// Order status should be controlled from the admin dashboard.
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  return Response.json(
    {
      error: "Order status can only be changed by an administrator",
    },
    {
      status: 403,
    }
  );
}

// Customers should NOT be allowed to delete orders.
export async function DELETE(
  request: Request,
  context: RouteContext
) {
  return Response.json(
    {
      error: "Orders cannot be deleted by customers",
    },
    {
      status: 403,
    }
  );
}