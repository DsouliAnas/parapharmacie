import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";

export async function GET(): Promise<Response> {
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

export async function POST(
  request: NextRequest
): Promise<Response> {
  try {
    await connectDB();

    const body: {
      name?: string;
      slug?: string;
      image?: string;
    } = await request.json();

    if (!body.name || !body.slug) {
      return Response.json(
        {
          error: "Name and slug are required",
        },
        {
          status: 400,
        }
      );
    }

    const category = await Category.create({
      name: body.name,
      slug: body.slug,
      image: body.image || "",
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