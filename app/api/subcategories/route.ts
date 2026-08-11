import { NextRequest } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Subcategory from "@/models/Subcategory";
import "@/models/Category";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } =
      new URL(request.url);

    const categoryId =
      searchParams.get("category");

    if (categoryId) {
      if (
        !mongoose.Types.ObjectId.isValid(
          categoryId
        )
      ) {
        return Response.json(
          {
            error: "Invalid category ID",
          },
          {
            status: 400,
          }
        );
      }
    }

    const filter: {
      category?: mongoose.Types.ObjectId;
    } = {};

    if (categoryId) {
      filter.category =
        new mongoose.Types.ObjectId(categoryId);
    }

    const subcategories =
      await Subcategory.find(filter)
        .populate("category", "name slug")
        .sort({
          name: 1,
        })
        .lean();

    return Response.json(
      subcategories,
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET SUBCATEGORIES ERROR:",
      error
    );

    return Response.json(
      {
        error:
          "Failed to fetch subcategories",
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
      category?: string;
      image?: string;
    } = await request.json();

    if (!body.name || !body.slug || !body.category) {
      return Response.json(
        {
          error: "Name, slug and category are required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(body.category)
    ) {
      return Response.json(
        {
          error: "Invalid category ID",
        },
        {
          status: 400,
        }
      );
    }

    const subcategory =
      await Subcategory.create({
        name: body.name,
        slug: body.slug,
        category: body.category,
        image: body.image || "",
      });

    return Response.json(
      subcategory,
      {
        status: 201,
      }
    );
  } catch (error) {
  console.error("CREATE SUBCATEGORY ERROR:", error);

  if (
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === 11000
) {
  return Response.json(
    {
      error:
        "A subcategory with this slug already exists in this category",
    },
    {
      status: 409,
    }
  );
} 

  return Response.json(
    {
      error: "Failed to create subcategory",
    },
    {
      status: 500,
    }
  );
}}