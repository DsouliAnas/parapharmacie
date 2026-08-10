import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Subcategory from "@/models/Subcategory";
import "@/models/Category";


// GET SUBCATEGORIES
// Optional filter:
// /api/subcategories?category=CATEGORY_ID

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const categoryId = searchParams.get("category");

    const filter = categoryId
      ? { category: categoryId }
      : {};

    const subcategories = await Subcategory.find(filter)
      .populate("category", "name")
      .sort({ name: 1 });

    return Response.json(subcategories);

  } catch (error) {

    console.error(
      "GET SUBCATEGORIES ERROR:",
      error
    );

    return Response.json(
      {
        error: "Failed to fetch subcategories"
      },
      {
        status: 500
      }
    );

  }
}