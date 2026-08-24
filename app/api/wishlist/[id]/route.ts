import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";

import Wishlist from "@/models/Wishlist";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function DELETE(
  request: Request,
  context: RouteContext
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
          error: "Not authenticated.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * ID VALIDATION
     */

    const { id } =
      await context.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return Response.json(
        {
          error: "Invalid wishlist ID.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    /*
     * FIND ONLY THE USER'S OWN WISHLIST ITEM
     */

    const wishlist =
      await Wishlist.findOne({
        _id: id,
        user: session.user.id,
      });

    if (!wishlist) {
      return Response.json(
        {
          error: "Wishlist item not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * DELETE
     */

    await wishlist.deleteOne();

    return Response.json(
      {
        message:
          "Removed from wishlist",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "DELETE WISHLIST ERROR:",
      error
    );

    return Response.json(
      {
        error: "Delete failed.",
      },
      {
        status: 500,
      }
    );
  }
}