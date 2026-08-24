import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";

import Wishlist from "@/models/Wishlist";
import Product from "@/models/Product";

interface AddWishlistBody {
  product?: unknown;
}

/*
|--------------------------------------------------------------------------
| GET USER WISHLIST
|--------------------------------------------------------------------------
| Authenticated users only
*/

export async function GET(): Promise<Response> {
  try {
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

    await connectDB();

    const wishlist =
      await Wishlist.find({
        user: session.user.id,
      })
        .populate(
          "product"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    return Response.json(
      wishlist,
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET WISHLIST ERROR:",
      error
    );

    return Response.json(
      {
        error:
          "Failed to get wishlist",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| ADD TO WISHLIST
|--------------------------------------------------------------------------
| Authenticated users only
*/

export async function POST(
  request: NextRequest
): Promise<Response> {
  try {
    /*
     * AUTHENTICATION
     */

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

    /*
     * REQUEST BODY
     */

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        {
          error: "Invalid JSON body.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return Response.json(
        {
          error: "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    const data =
      body as AddWishlistBody;

    /*
     * PRODUCT ID
     */

    if (
      typeof data.product !== "string" ||
      !mongoose.Types.ObjectId.isValid(
        data.product
      )
    ) {
      return Response.json(
        {
          error: "Invalid product ID.",
        },
        {
          status: 400,
        }
      );
    }

    const productId =
      new mongoose.Types.ObjectId(
        data.product
      );

    await connectDB();

    /*
     * CHECK PRODUCT
     */

    const product =
      await Product.findOne({
        _id: productId,
        isActive: true,
      })
        .select("_id")
        .lean();

    if (!product) {
      return Response.json(
        {
          error:
            "Product not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * PREVENT DUPLICATE
     */

    const exists =
      await Wishlist.findOne({
        user: session.user.id,
        product: productId,
      })
        .select("_id")
        .lean();

    if (exists) {
      return Response.json(
        {
          message:
            "Already in wishlist",
        },
        {
          status: 200,
        }
      );
    }

    /*
     * CREATE
     */

    const wishlist =
      await Wishlist.create({
        user: session.user.id,
        product: productId,
      });

    return Response.json(
      wishlist,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "ADD WISHLIST ERROR:",
      error
    );

    /*
     * Handle duplicate-key errors
     * if a unique compound index exists.
     */

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return Response.json(
        {
          message:
            "Already in wishlist",
        },
        {
          status: 200,
        }
      );
    }

    return Response.json(
      {
        error:
          "Failed to add wishlist",
      },
      {
        status: 500,
      }
    );
  }
}