import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { authOptions } from "@/lib/auth";

interface OrderProductInput {
  product: unknown;
  quantity: unknown;
}

interface CreateOrderBody {
  customerName?: unknown;
  customerEmail?: unknown;
  phone?: unknown;
  backupPhone?: unknown;
  address?: unknown;
  city?: unknown;
  postalCode?: unknown;
  products?: unknown;
}

interface ProductMapItem {
  _id: mongoose.Types.ObjectId;
  name: string;
  price: number;
  discountPrice?: number;
}

const MAX_BODY_SIZE = 100_000;
const MAX_PRODUCTS = 50;
const MAX_QUANTITY_PER_PRODUCT = 100;

function isAllowedOrigin(
  request: NextRequest
): boolean {
  const origin = request.headers.get("origin");

  /*
   * Some legitimate requests may not contain Origin.
   * Authentication is still required for mutations.
   */
  if (!origin) {
    return true;
  }

  const allowedOrigin =
    process.env.NEXTAUTH_URL?.replace(/\/$/, "");

  if (!allowedOrigin) {
    return false;
  }

  return origin === allowedOrigin;
}

function isValidObjectId(
  value: string
): boolean {
  return mongoose.Types.ObjectId.isValid(value);
}

function cleanString(
  value: unknown,
  maxLength: number
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.trim();

  if (!cleaned || cleaned.length > maxLength) {
    return null;
  }

  return cleaned;
}

function isValidEmail(
  email: string
): boolean {
  if (email.length > 254) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

function isValidPhone(
  phone: string
): boolean {
  if (phone.length > 30) {
    return false;
  }

  return /^[+0-9\s().-]+$/.test(phone);
}

function getEffectivePrice(
  product: ProductMapItem
): number {
  if (
    typeof product.discountPrice === "number" &&
    Number.isFinite(product.discountPrice) &&
    product.discountPrice >= 0 &&
    product.discountPrice < product.price
  ) {
    return product.discountPrice;
  }

  return product.price;
}

async function parseJsonBody(
  request: NextRequest
): Promise<
  | {
      ok: true;
      body: CreateOrderBody;
    }
  | {
      ok: false;
      response: Response;
    }
> {
  const contentLength =
    request.headers.get("content-length");

  if (
    contentLength &&
    Number(contentLength) > MAX_BODY_SIZE
  ) {
    return {
      ok: false,
      response: Response.json(
        {
          error: "Request too large.",
        },
        {
          status: 413,
        }
      ),
    };
  }

  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    return {
      ok: false,
      response: Response.json(
        {
          error: "Invalid JSON.",
        },
        {
          status: 400,
        }
      ),
    };
  }

  if (
    typeof rawBody !== "object" ||
    rawBody === null ||
    Array.isArray(rawBody)
  ) {
    return {
      ok: false,
      response: Response.json(
        {
          error: "Invalid request body.",
        },
        {
          status: 400,
        }
      ),
    };
  }

  return {
    ok: true,
    body: rawBody as CreateOrderBody,
  };
}

/*
|--------------------------------------------------------------------------
| CREATE ORDER
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| The browser is NOT trusted for:
|
| - price
| - totalPrice
| - user
| - status
| - paymentMethod
| - revenue information
|
| The server calculates everything important.
|
|--------------------------------------------------------------------------
*/

export async function POST(
  request: NextRequest
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
     * 2. Origin protection
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
     * 3. Parse body
     */

    const parsed =
      await parseJsonBody(request);

    if (!parsed.ok) {
      return parsed.response;
    }

    const body = parsed.body;

    /*
     * 4. Validate customer information
     */

    const customerName =
      cleanString(body.customerName, 100);

    const customerEmail =
      cleanString(body.customerEmail, 254);

    const phone =
      cleanString(body.phone, 30);

    const backupPhone =
      body.backupPhone === undefined ||
      body.backupPhone === null
        ? ""
        : cleanString(body.backupPhone, 30);

    const address =
      cleanString(body.address, 300);

    const city =
      body.city === undefined ||
      body.city === null
        ? ""
        : cleanString(body.city, 100);

    const postalCode =
      body.postalCode === undefined ||
      body.postalCode === null
        ? ""
        : cleanString(body.postalCode, 20);

    if (
      !customerName ||
      !customerEmail ||
      !phone ||
      !address
    ) {
      return Response.json(
        {
          error:
            "Name, email, phone and address are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!isValidEmail(customerEmail)) {
      return Response.json(
        {
          error: "Invalid email address.",
        },
        {
          status: 400,
        }
      );
    }

    if (!isValidPhone(phone)) {
      return Response.json(
        {
          error: "Invalid phone number.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      backupPhone &&
      !isValidPhone(backupPhone)
    ) {
      return Response.json(
        {
          error: "Invalid backup phone number.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * 5. Validate products array
     */

    if (!Array.isArray(body.products)) {
      return Response.json(
        {
          error: "Products must be an array.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      body.products.length === 0
    ) {
      return Response.json(
        {
          error:
            "Your order must contain at least one product.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      body.products.length >
      MAX_PRODUCTS
    ) {
      return Response.json(
        {
          error:
            "Too many products in one order.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * 6. Validate product IDs and quantities
     *
     * We deliberately DO NOT accept price from
     * the client.
     */

    const requestedProducts: Array<{
      productId: string;
      quantity: number;
    }> = [];

    const productIds =
      new Set<string>();

    for (
      const rawProduct of body.products
    ) {
      if (
        typeof rawProduct !==
          "object" ||
        rawProduct === null ||
        Array.isArray(rawProduct)
      ) {
        return Response.json(
          {
            error:
              "Invalid product information.",
          },
          {
            status: 400,
          }
        );
      }

      const productInput =
        rawProduct as OrderProductInput;

      if (
        typeof productInput.product !==
        "string"
      ) {
        return Response.json(
          {
            error:
              "Invalid product ID.",
          },
          {
            status: 400,
          }
        );
      }

      const productId =
        productInput.product.trim();

      if (
        !isValidObjectId(productId)
      ) {
        return Response.json(
          {
            error:
              "Invalid product ID.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        typeof productInput.quantity !==
        "number" ||
        !Number.isInteger(
          productInput.quantity
        ) ||
        productInput.quantity < 1 ||
        productInput.quantity >
          MAX_QUANTITY_PER_PRODUCT
      ) {
        return Response.json(
          {
            error:
              "Invalid product quantity.",
          },
          {
            status: 400,
          }
        );
      }

      /*
       * Prevent the same product from appearing
       * multiple times in the order.
       */
      if (productIds.has(productId)) {
        return Response.json(
          {
            error:
              "The same product cannot appear multiple times.",
          },
          {
            status: 400,
          }
        );
      }

      productIds.add(productId);

      requestedProducts.push({
        productId,
        quantity:
          productInput.quantity,
      });
    }

    /*
     * 7. Connect to database
     */

    await connectDB();

    /*
     * 8. Load the REAL products from MongoDB
     */

    const objectIds =
      requestedProducts.map(
        (item) =>
          new mongoose.Types.ObjectId(
            item.productId
          )
      );

    const products =
      await Product.find({
        _id: {
          $in: objectIds,
        },
        isActive: true,
      })
        .select(
          "_id name price discountPrice stock"
        )
        .lean();

    /*
     * Make sure every requested product exists.
     */

    if (
      products.length !==
      requestedProducts.length
    ) {
      return Response.json(
        {
          error:
            "One or more products are unavailable.",
        },
        {
          status: 400,
        }
      );
    }

    const productMap =
      new Map<string, ProductMapItem>();

    for (
      const product of products
    ) {
      productMap.set(
        String(product._id),
        {
          _id: product._id,
          name: product.name,
          price: product.price,
          discountPrice:
            product.discountPrice,
        }
      );
    }

    /*
     * 9. Calculate order prices on the SERVER
     */

    const orderProducts: Array<{
      product: mongoose.Types.ObjectId;
      quantity: number;
      price: number;
    }> = [];

    let productsTotal = 0;

    for (
      const requested of requestedProducts
    ) {
      const product =
        productMap.get(
          requested.productId
        );

      if (!product) {
        return Response.json(
          {
            error:
              "Product unavailable.",
          },
          {
            status: 400,
          }
        );
      }

      const price =
        getEffectivePrice(product);

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        return Response.json(
          {
            error:
              "Invalid product price.",
          },
          {
            status: 500,
          }
        );
      }

      const lineTotal =
        price * requested.quantity;

      productsTotal += lineTotal;

      orderProducts.push({
        product: product._id,
        quantity:
          requested.quantity,
        price,
      });
    }

    /*
     * Keep this server-side.
     *
     * If your actual delivery system has another
     * rule, change it here — never trust the client.
     */

    const deliveryFee =
      7;

    const totalPrice =
      productsTotal + deliveryFee;

    /*
     * 10. Create order
     */

    const order =
      await Order.create({
        user: session.user.id,

        customerName,

        customerEmail,

        phone,

        backupPhone: backupPhone || "",

        address,

        city: city || "",

        postalCode:
          postalCode || "",

        products:
          orderProducts,

        totalPrice,

        paymentMethod:
          "Cash on Delivery",

        status: "Pending",

        deliveredAt: undefined,

        isRevenueCounted: false,
      });

    /*
     * 11. Return only safe information
     */

    return Response.json(
      {
        _id: String(order._id),
        orderNumber:
          order.orderNumber,
        status:
          order.status,
        totalPrice:
          order.totalPrice,
        createdAt:
          order.createdAt,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE ORDER ERROR:",
      error
    );

    return Response.json(
      {
        error:
          "Failed to create order.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| GET ORDERS
|--------------------------------------------------------------------------
|
| Admin:
|   all orders
|
| Customer:
|   own orders only
|
|--------------------------------------------------------------------------
*/

export async function GET(): Promise<Response> {
  try {
    const session =
      await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json(
        {
          error:
            "Not authenticated.",
        },
        {
          status: 401,
        }
      );
    }

    await connectDB();

    /*
     * Admin can see all orders.
     */

    if (
      session.user.role === "admin"
    ) {
      const orders =
        await Order.find({})
          .populate({
            path: "products.product",
            select:
              "_id name images price discountPrice",
          })
          .sort({
            createdAt: -1,
          })
          .lean();

      return Response.json(
        orders,
        {
          status: 200,
        }
      );
    }

    /*
     * Customer can ONLY see their own orders.
     */

    const orders =
      await Order.find({
        user: session.user.id,
      })
        .populate({
          path: "products.product",
          select:
            "_id name images price discountPrice",
        })
        .sort({
          createdAt: -1,
        })
        .lean();

    return Response.json(
      orders,
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET ORDERS ERROR:",
      error
    );

    return Response.json(
      {
        error:
          "Failed to fetch orders.",
      },
      {
        status: 500,
      }
    );
  }
}