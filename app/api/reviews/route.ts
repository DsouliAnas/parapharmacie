import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";

import Review from "@/models/Review";
import Product from "@/models/Product";

interface CreateReviewBody {
  product?: unknown;
  rating?: unknown;
  comment?: unknown;
}

function cleanComment(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const comment = value.trim();

  if (!comment || comment.length > 1000) {
    return null;
  }

  return comment;
}

function isValidObjectId(value: unknown): boolean {
  return (
    typeof value === "string" &&
    mongoose.Types.ObjectId.isValid(value)
  );
}

/*
|--------------------------------------------------------------------------
| GET REVIEWS
|--------------------------------------------------------------------------
| Public
*/

export async function GET(
  request: NextRequest
): Promise<Response> {
  try {
    await connectDB();

    const { searchParams } =
      new URL(request.url);

    const productId =
      searchParams.get("productId");

    if (
      productId &&
      !isValidObjectId(productId)
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

    const reviews = await Review.find(
      productId
        ? {
            product: productId,
          }
        : {}
    )
      .populate(
        "user",
        "name"
      )
      .sort({
        createdAt: -1,
      })
      .lean();

    return Response.json(
      reviews,
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET REVIEWS ERROR:",
      error
    );

    return Response.json(
      {
        error: "Failed to get reviews.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| CREATE REVIEW
|--------------------------------------------------------------------------
| Authenticated users only
*/

export async function POST(
  request: NextRequest
): Promise<Response> {
  try {
    const session =
      await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json(
        {
          error:
            "Vous devez être connecté.",
        },
        {
          status: 401,
        }
      );
    }

    await connectDB();

    let rawBody: unknown;

    try {
      rawBody = await request.json();
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
      rawBody as CreateReviewBody;

    /*
     * PRODUCT
     */

    if (!isValidObjectId(body.product)) {
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
      body.product as string;

    /*
     * RATING
     */

    if (
      typeof body.rating !== "number" ||
      !Number.isInteger(body.rating) ||
      body.rating < 1 ||
      body.rating > 5
    ) {
      return Response.json(
        {
          error:
            "Rating must be an integer between 1 and 5.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * COMMENT
     */

    const comment =
      cleanComment(body.comment);

    if (!comment) {
      return Response.json(
        {
          error:
            "Comment is required and must contain at most 1000 characters.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * CHECK PRODUCT
     */

    const product =
      await Product.findById(productId)
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
     * PREVENT DUPLICATE REVIEW
     */

    const existingReview =
      await Review.findOne({
        product: productId,
        user: session.user.id,
      })
        .select("_id")
        .lean();

    if (existingReview) {
      return Response.json(
        {
          error:
            "You have already reviewed this product.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * CREATE REVIEW
     */

    const review =
      await Review.create({
        product: productId,
        user: session.user.id,
        name:
          session.user.name ||
          "Client",
        rating: body.rating,
        comment,
      });

    return Response.json(
      review,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE REVIEW ERROR:",
      error
    );

    return Response.json(
      {
        error:
          "Failed to create review.",
      },
      {
        status: 500,
      }
    );
  }
}