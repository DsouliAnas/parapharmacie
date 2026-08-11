import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import "@/models/Product";

import { authOptions } from "@/lib/auth";

interface OrderProductInput {
  product: string;
  quantity: number;
  price: number;
}

interface CreateOrderBody {
  customerName: string;
  customerEmail: string;
  phone: string;
  backupPhone?: string;
  address: string;
  products: OrderProductInput[];
  totalPrice: number;
}

function isValidProduct(product: OrderProductInput): boolean {
  return (
    typeof product.product === "string" &&
    product.product.length > 0 &&
    typeof product.quantity === "number" &&
    Number.isInteger(product.quantity) &&
    product.quantity > 0 &&
    typeof product.price === "number" &&
    Number.isFinite(product.price) &&
    product.price >= 0
  );
}

// CREATE ORDER
export async function POST(request: NextRequest) {
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

    const body: CreateOrderBody = await request.json();

    if (
      !body.customerName?.trim() ||
      !body.customerEmail?.trim() ||
      !body.phone?.trim() ||
      !body.address?.trim() ||
      !Array.isArray(body.products) ||
      body.products.length === 0
    ) {
      return Response.json(
        {
          error: "Missing required order information",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof body.totalPrice !== "number" ||
      !Number.isFinite(body.totalPrice) ||
      body.totalPrice < 0
    ) {
      return Response.json(
        {
          error: "Invalid total price",
        },
        {
          status: 400,
        }
      );
    }

    const validProducts = body.products.every(
      isValidProduct
    );

    if (!validProducts) {
      return Response.json(
        {
          error: "Invalid product information",
        },
        {
          status: 400,
        }
      );
    }

    const order = await Order.create({
      user: session.user.id,

      customerName: body.customerName.trim(),
      customerEmail: body.customerEmail.trim(),
      phone: body.phone.trim(),
      backupPhone: body.backupPhone?.trim() || "",
      address: body.address.trim(),

      products: body.products,

      totalPrice: body.totalPrice,

      paymentMethod: "Cash on Delivery",

      status: "Pending",
    });

    return Response.json(
      {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalPrice: order.totalPrice,
        createdAt: order.createdAt,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    return Response.json(
      {
        error: "Failed to create order",
      },
      {
        status: 500,
      }
    );
  }
}

// GET LOGGED-IN USER'S ORDERS
export async function GET() {
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

    const orders = await Order.find({
      user: session.user.id,
    })
      .populate({
        path: "products.product",
        select: "name images price discountPrice",
      })
      .sort({
        createdAt: -1,
      });

    return Response.json(orders);
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);

    return Response.json(
      {
        error: "Failed to fetch orders",
      },
      {
        status: 500,
      }
    );
  }
}