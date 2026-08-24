import { NextRequest } from "next/server";

import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Brand from "@/models/Brand";
import Subcategory from "@/models/Subcategory";

function escapeRegex(value: string): string {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

export async function GET(
  request: NextRequest
): Promise<Response> {
  try {
    await connectDB();

    const { searchParams } =
      new URL(request.url);

    const rawQuery =
      searchParams.get("q") || "";

    const query = rawQuery.trim();

    /*
     * Empty search
     */

    if (!query) {
      return Response.json(
        {
          products: [],
          brands: [],
          subcategories: [],
        },
        {
          status: 200,
        }
      );
    }

    /*
     * Prevent excessively large queries
     */

    if (query.length > 100) {
      return Response.json(
        {
          error:
            "Search query is too long.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Escape regex characters so the user
     * cannot inject regex operators.
     */

    const escapedQuery =
      escapeRegex(query);

    const regex = new RegExp(
      escapedQuery,
      "i"
    );

    const [
      products,
      brands,
      subcategories,
    ] = await Promise.all([
      Product.find({
        isActive: true,
        name: regex,
      })
        .select("_id name images")
        .limit(5)
        .lean(),

      Brand.find({
        name: regex,
      })
        .select("_id name")
        .limit(3)
        .lean(),

      Subcategory.find({
        name: regex,
      })
        .select("_id name")
        .limit(3)
        .lean(),
    ]);

    return Response.json(
      {
        products,
        brands,
        subcategories,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "SEARCH SUGGESTIONS ERROR:",
      error
    );

    return Response.json(
      {
        error:
          "Failed to fetch search suggestions.",
      },
      {
        status: 500,
      }
    );
  }
}