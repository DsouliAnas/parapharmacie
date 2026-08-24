import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Order, {
  OrderStatus,
} from "@/models/Order";
import Product from "@/models/Product";
import { authOptions } from "@/lib/auth";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

interface UpdateOrderBody {
  status?: unknown;
}

const VALID_STATUSES: OrderStatus[] = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

/*
 * Allowed order status transitions.
 *
 * Pending
 *   -> Processing
 *   -> Cancelled
 *
 * Processing
 *   -> Shipped
 *   -> Cancelled
 *
 * Shipped
 *   -> Delivered
 *   -> Cancelled
 *
 * Delivered
 *   -> nothing
 *
 * Cancelled
 *   -> nothing
 */
const ALLOWED_TRANSITIONS: Record<
  OrderStatus,
  OrderStatus[]
> = {
  Pending: [
    "Processing",
    "Cancelled",
  ],

  Processing: [
    "Shipped",
    "Cancelled",
  ],

  Shipped: [
    "Delivered",
    "Cancelled",
  ],

  Delivered: [],

  Cancelled: [],
};

const MAX_BODY_SIZE = 20_000;

function isAllowedOrigin(
  request: NextRequest
): boolean {
  const origin =
    request.headers.get("origin");

  /*
   * Requests without an Origin header can still
   * be legitimate server/browser requests.
   *
   * Authentication is required separately.
   */
  if (!origin) {
    return true;
  }

  const allowedOrigin =
    process.env.NEXTAUTH_URL?.replace(
      /\/$/,
      ""
    );

  if (!allowedOrigin) {
    return false;
  }

  return origin === allowedOrigin;
}

function isValidObjectId(
  value: string
): boolean {
  return mongoose.Types.ObjectId.isValid(
    value
  );
}

/*
|--------------------------------------------------------------------------
| GET ONE ORDER
|--------------------------------------------------------------------------
|
| Admin:
|   Can view any order.
|
| Customer:
|   Can view only their own order.
|
|--------------------------------------------------------------------------
*/

export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<Response> {
  try {
    /*
     * 1. Authentication
     */

    const session =
      await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json(
        {
          error: "Not authenticated.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * 2. Validate order ID
     */

    const { id } =
      await context.params;

    if (!isValidObjectId(id)) {
      return Response.json(
        {
          error: "Invalid order ID.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * 3. Database
     */

    await connectDB();

    /*
     * 4. Admin can view any order
     */

    if (
      session.user.role === "admin"
    ) {
      const order =
        await Order.findById(id)
          .populate({
            path: "products.product",
            select:
              "_id name images price discountPrice stock",
          })
          .lean();

      if (!order) {
        return Response.json(
          {
            error: "Order not found.",
          },
          {
            status: 404,
          }
        );
      }

      return Response.json(order);
    }

    /*
     * 5. Customer can only view their own order
     */

    const order =
      await Order.findOne({
        _id: id,
        user: session.user.id,
      })
        .populate({
          path: "products.product",
          select:
            "_id name images price discountPrice stock",
        })
        .lean();

    if (!order) {
      return Response.json(
        {
          error: "Order not found.",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(order);
  } catch (error) {
    console.error(
      "GET ORDER ERROR:",
      error
    );

    return Response.json(
      {
        error: "Failed to get order.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PATCH ORDER STATUS
|--------------------------------------------------------------------------
|
| ADMIN ONLY.
|
| Stock is reduced ONLY when an order becomes
| Delivered.
|
| The stock update and order update happen inside
| the same MongoDB transaction.
|
|--------------------------------------------------------------------------
*/

export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  const mongoSession =
    await mongoose.startSession();

  try {
    /*
     * 1. Authentication
     */

    const session =
      await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json(
        {
          error: "Not authenticated.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * 2. Admin only
     */

    if (
      session.user.role !== "admin"
    ) {
      return Response.json(
        {
          error: "Admin access required.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * 3. Origin protection
     */

    if (!isAllowedOrigin(request)) {
      return Response.json(
        {
          error: "Invalid request origin.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * 4. Validate order ID
     */

    const { id } =
      await context.params;

    if (!isValidObjectId(id)) {
      return Response.json(
        {
          error: "Invalid order ID.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * 5. Request size protection
     */

    const contentLength =
      request.headers.get(
        "content-length"
      );

    if (
      contentLength &&
      Number(contentLength) >
        MAX_BODY_SIZE
    ) {
      return Response.json(
        {
          error: "Request too large.",
        },
        {
          status: 413,
        }
      );
    }

    /*
     * 6. Parse JSON safely
     */

    let rawBody: unknown;

    try {
      rawBody =
        await request.json();
    } catch {
      return Response.json(
        {
          error: "Invalid JSON.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof rawBody !== "object" ||
      rawBody === null ||
      Array.isArray(rawBody)
    ) {
      return Response.json(
        {
          error:
            "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    const body =
      rawBody as UpdateOrderBody;

    /*
     * 7. Only allow the "status" field
     */

    for (
      const key of Object.keys(body)
    ) {
      if (key !== "status") {
        return Response.json(
          {
            error:
              "Invalid field in request.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /*
     * 8. Validate status
     */

    if (
      typeof body.status !==
      "string"
    ) {
      return Response.json(
        {
          error:
            "Invalid order status.",
        },
        {
          status: 400,
        }
      );
    }

    const nextStatus =
      body.status as OrderStatus;

    if (
      !VALID_STATUSES.includes(
        nextStatus
      )
    ) {
      return Response.json(
        {
          error:
            "Invalid order status.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * 9. Connect to database
     */

    await connectDB();

    /*
     * 10. Run transaction
     */

    let updatedOrder:
      | ReturnType<
          typeof Order.findOneAndUpdate
        >
      | null = null;

    await mongoSession.withTransaction(
      async () => {
        /*
         * Find the current order inside
         * the transaction.
         */

        const order =
          await Order.findById(id)
            .session(mongoSession);

        if (!order) {
          throw new Error(
            "ORDER_NOT_FOUND"
          );
        }

        const currentStatus =
          order.status as OrderStatus;

        /*
         * Prevent changing to the
         * same status.
         */

        if (
          currentStatus ===
          nextStatus
        ) {
          throw new Error(
            "SAME_STATUS"
          );
        }

        /*
         * Check allowed transition.
         */

        const allowedStatuses =
          ALLOWED_TRANSITIONS[
            currentStatus
          ];

        if (
          !allowedStatuses.includes(
            nextStatus
          )
        ) {
          throw new Error(
            "INVALID_TRANSITION"
          );
        }

        /*
         * DELIVERED
         *
         * Reduce stock atomically.
         */

        if (
          nextStatus === "Delivered"
        ) {
          for (
            const item of order.products
          ) {
            const quantity =
              item.quantity;

            if (
              !Number.isInteger(
                quantity
              ) ||
              quantity <= 0
            ) {
              throw new Error(
                "INVALID_ORDER_QUANTITY"
              );
            }

            const updatedProduct =
              await Product.findOneAndUpdate(
                {
                  _id: item.product,
                  stock: {
                    $gte: quantity,
                  },
                },
                {
                  $inc: {
                    stock: -quantity,
                  },
                },
                {
                  new: true,
                  session:
                    mongoSession,
                }
              );

            if (!updatedProduct) {
              throw new Error(
                "INSUFFICIENT_STOCK"
              );
            }
          }
        }

        /*
         * Prepare only the fields that
         * need to change.
         *
         * We intentionally use an update
         * query instead of order.save().
         *
         * This prevents old orders from
         * failing validation because of
         * newer required fields such as
         * "user".
         */

        const updateFields: {
          status: OrderStatus;
          isRevenueCounted: boolean;
          deliveredAt?: Date;
        } = {
          status: nextStatus,

          /*
           * Cash-on-delivery revenue is
           * counted only after delivery.
           */
          isRevenueCounted:
            nextStatus === "Delivered",
        };

        /*
         * Set deliveredAt only when the
         * order becomes Delivered.
         */

        if (
          nextStatus === "Delivered"
        ) {
          updateFields.deliveredAt =
            new Date();
        }

        /*
         * If the order is cancelled,
         * make sure it isn't counted
         * as revenue.
         */

        if (
          nextStatus === "Cancelled"
        ) {
          updateFields.isRevenueCounted =
            false;
        }

        /*
         * Update only the required fields.
         *
         * The current status is included
         * in the query so the update won't
         * accidentally overwrite a status
         * changed by another request.
         */

        const result =
          await Order.findOneAndUpdate(
            {
              _id: id,
              status: currentStatus,
            },
            {
              $set: updateFields,
            },
            {
              new: true,
              session:
                mongoSession,

              /*
               * We only update controlled fields,
               * so full document validation is not
               * necessary here.
               */
            }
          );

        if (!result) {
          throw new Error(
            "ORDER_UPDATE_FAILED"
          );
        }

        updatedOrder = result;
      }
    );

    /*
     * 11. Make sure the transaction
     * actually produced an order.
     */

    if (!updatedOrder) {
      return Response.json(
        {
          error:
            "Failed to update order.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * 12. Success
     */

    return Response.json(
      {
        success: true,
        order: updatedOrder,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "UPDATE ORDER STATUS ERROR:",
      error
    );

    if (
      error instanceof Error
    ) {
      switch (error.message) {
        case "ORDER_NOT_FOUND":
          return Response.json(
            {
              error:
                "Order not found.",
            },
            {
              status: 404,
            }
          );

        case "SAME_STATUS":
          return Response.json(
            {
              error:
                "The order already has this status.",
            },
            {
              status: 400,
            }
          );

        case "INVALID_TRANSITION":
          return Response.json(
            {
              error:
                "This status change is not allowed.",
            },
            {
              status: 400,
            }
          );

        case "INSUFFICIENT_STOCK":
          return Response.json(
            {
              error:
                "There is not enough stock to mark this order as delivered.",
            },
            {
              status: 409,
            }
          );

        case "INVALID_ORDER_QUANTITY":
          return Response.json(
            {
              error:
                "The order contains an invalid quantity.",
            },
            {
              status: 500,
            }
          );

        case "ORDER_UPDATE_FAILED":
          return Response.json(
            {
              error:
                "The order could not be updated because it may have changed.",
            },
            {
              status: 409,
            }
          );
      }
    }

    return Response.json(
      {
        error:
          "Failed to update order status.",
      },
      {
        status: 500,
      }
    );
  } finally {
    await mongoSession.endSession();
  }
}

/*
|--------------------------------------------------------------------------
| DELETE ORDER
|--------------------------------------------------------------------------
|
| Orders cannot be deleted.
|
|--------------------------------------------------------------------------
*/

export async function DELETE(
  _request: NextRequest,
  _context: RouteContext
): Promise<Response> {
  return Response.json(
    {
      error:
        "Orders cannot be deleted.",
    },
    {
      status: 403,
    }
  );
}