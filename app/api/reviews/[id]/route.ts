import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";

import Review from "@/models/Review";

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
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
          error:
            "Not authenticated.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * VALIDATE ID
     */

    const { id } =
      await context.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return Response.json(
        {
          error:
            "Invalid review ID.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    /*
     * FIND REVIEW
     */

    const review =
      await Review.findById(id);

    if (!review) {
      return Response.json(
        {
          error:
            "Review not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * AUTHORIZATION
     *
     * Admin can delete anything.
     *
     * Customer can delete only
     * their own review.
     */

    const isAdmin =
      session.user.role === "admin";

    const isOwner =
      String(review.user) ===
      String(session.user.id);

    if (!isAdmin && !isOwner) {
      return Response.json(
        {
          error:
            "You are not allowed to delete this review.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * DELETE
     */

    await review.deleteOne();

    return Response.json(
      {
        message:
          "Review deleted successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "DELETE REVIEW ERROR:",
      error
    );

    return Response.json(
      {
        error:
          "Delete failed.",
      },
      {
        status: 500,
      }
    );
  }
}