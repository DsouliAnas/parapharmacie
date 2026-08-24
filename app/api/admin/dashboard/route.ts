import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";

import { authOptions } from "@/lib/auth";

interface MonthlyRevenue {
  month: number;
  monthName: string;
  revenue: number;
}

const MONTH_NAMES: string[] = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];

export async function GET(
  request: NextRequest
): Promise<Response> {
  try {
    await connectDB();

    const session =
      await getServerSession(authOptions);

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

    if (session.user.role !== "admin") {
      return Response.json(
        {
          error: "Unauthorized",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * Get the requested year.
     *
     * Example:
     * /api/admin/dashboard?year=2025
     *
     * If no year is provided, use the current year.
     */

    const searchParams =
      request.nextUrl.searchParams;

    const yearParameter =
      searchParams.get("year");

    const currentYear =
      new Date().getFullYear();

    let selectedYear = currentYear;

    if (yearParameter) {
      const parsedYear = Number(
        yearParameter
      );

      if (
        Number.isInteger(parsedYear) &&
        parsedYear >= 2000 &&
        parsedYear <= 2100
      ) {
        selectedYear = parsedYear;
      }
    }

    /*
     * Date boundaries for the selected year.
     *
     * Example for 2025:
     *
     * start = 2025-01-01
     * end   = 2026-01-01
     */

    const startOfYear = new Date(
      selectedYear,
      0,
      1,
      0,
      0,
      0,
      0
    );

    const startOfNextYear = new Date(
      selectedYear + 1,
      0,
      1,
      0,
      0,
      0,
      0
    );

    /*
     * General dashboard statistics.
     */

    const [
      ordersCount,
      customersCount,
      productsCount,
    ] = await Promise.all([
      Order.countDocuments(),

      User.countDocuments({
        role: {
          $ne: "admin",
        },
      }),

      Product.countDocuments(),
    ]);

    /*
     * Revenue:
     *
     * ONLY Delivered orders count.
     *
     * The revenue is calculated using totalPrice.
     *
     * We use updatedAt as the delivery date if
     * deliveredAt does not exist in older orders.
     */

    const deliveredOrders =
      await Order.find({
        status: "Delivered",
        $or: [
          {
            deliveredAt: {
              $gte: startOfYear,
              $lt: startOfNextYear,
            },
          },
          {
            deliveredAt: {
              $exists: false,
            },
            updatedAt: {
              $gte: startOfYear,
              $lt: startOfNextYear,
            },
          },
        ],
      }).select(
        "totalPrice deliveredAt updatedAt"
      );

    /*
     * Calculate total revenue for the selected year.
     */

    let revenue = 0;

    for (const order of deliveredOrders) {
      revenue += order.totalPrice;
    }

    /*
     * Create all 12 months first.
     *
     * This guarantees that months with no revenue
     * still appear in the chart as 0.
     */

    const monthlyRevenue: MonthlyRevenue[] =
      MONTH_NAMES.map(
        (
          monthName: string,
          index: number
        ) => ({
          month: index + 1,
          monthName,
          revenue: 0,
        })
      );

    /*
     * Put each delivered order into its month.
     */

    for (const order of deliveredOrders) {
      const deliveryDate =
        order.deliveredAt ??
        order.updatedAt;

      const month =
        deliveryDate.getMonth();

      monthlyRevenue[month].revenue +=
        order.totalPrice;
    }

    /*
     * Round revenue values.
     */

    for (const month of monthlyRevenue) {
      month.revenue =
        Math.round(
          month.revenue * 100
        ) / 100;
    }

    revenue =
      Math.round(revenue * 100) / 100;

    return Response.json(
      {
        orders: ordersCount,
        customers: customersCount,
        products: productsCount,
        revenue,
        monthlyRevenue,
        year: selectedYear,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "ADMIN DASHBOARD ERROR:",
      error
    );

    return Response.json(
      {
        error:
          "Failed to load dashboard data",
      },
      {
        status: 500,
      }
    );
  }
}