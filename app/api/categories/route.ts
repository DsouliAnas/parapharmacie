import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find()
      .sort({ name: 1 })
      .lean();

    return Response.json(categories);
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);

    return Response.json(
      {
        error: "Failed to fetch categories",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const category = await Category.create({
      name: body.name,
      slug: body.slug,
      image: body.image || "",
      subcategories: body.subcategories || [],
    });

    return Response.json(category, {
      status: 201,
    });
  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);

    return Response.json(
      {
        error: "Failed to create category",
      },
      {
        status: 500,
      }
    );
  }
}