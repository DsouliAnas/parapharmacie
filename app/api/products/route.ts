import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";

import "@/models/Category";
import "@/models/Brand";
import "@/models/Subcategory";

import Product from "@/models/Product";

// GET PRODUCTS

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const brand = searchParams.get("brand");
    const sort = searchParams.get("sort") || "newest";
    const search = searchParams.get("search");

    const filter: {
      category?: string;
      subcategory?: string;
      brand?: string;
      $or?: Array<{
        name?: {
          $regex: string;
          $options: string;
        };
        brand?: {
          $in: string[];
        };
      }>;
    } = {};

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Subcategory filter
    if (subcategory) {
      filter.subcategory = subcategory;
    }

    // Brand filter
    if (brand) {
      filter.brand = brand;
    }

    // Search by product name OR brand name
    if (search && search.trim() !== "") {
      const searchValue = search.trim();

      const brands = await import("@/models/Brand").then(
        ({ default: Brand }) =>
          Brand.find({
            name: {
              $regex: searchValue,
              $options: "i",
            },
          }).select("_id")
      );

      const brandIds = brands.map((item) => item._id.toString());

      filter.$or = [
        {
          name: {
            $regex: searchValue,
            $options: "i",
          },
        },
      ];

      if (brandIds.length > 0) {
        filter.$or.push({
          brand: {
            $in: brandIds,
          },
        });
      }
    }

    // Sorting
    let sortOption: Record<string, 1 | -1> = {
      createdAt: -1,
    };

    if (sort === "price-asc") {
      sortOption = {
        price: 1,
      };
    }

    if (sort === "price-desc") {
      sortOption = {
        price: -1,
      };
    }

    if (sort === "name") {
      sortOption = {
        name: 1,
      };
    }

    if (sort === "newest") {
      sortOption = {
        createdAt: -1,
      };
    }

    const products = await Product.find(filter)
      .populate("category")
      .populate("subcategory")
      .populate("brand")
      .sort(sortOption);

    return Response.json(products);
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return Response.json(
      {
        error: "Failed to fetch products",
      },
      {
        status: 500,
      }
    );
  }
}

// CREATE PRODUCT

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const product = await Product.create(body);

    const populatedProduct = await Product.findById(product._id)
      .populate("category")
      .populate("subcategory")
      .populate("brand");

    return Response.json(populatedProduct, {
      status: 201,
    });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    return Response.json(
      {
        error: "Failed to create product",
      },
      {
        status: 500,
      }
    );
  }
}