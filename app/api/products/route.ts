import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import "@/models/Category";
import "@/models/Brand";
import "@/models/Subcategory";

import { authOptions } from "@/lib/auth";

interface ProductCreateBody {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category?: string;
  subcategory?: string;
  brand?: string;
  stock?: number;
  isActive?: boolean;
}

interface ProductFilter {
  category?: string;
  subcategory?: string;
  brand?: string;
  stock?: {
    $gt: number;
  };
  price?: {
    $gte?: number;
    $lte?: number;
  };
  $or?: Array<
    | {
        name: {
          $regex: string;
          $options: string;
        };
      }
    | {
        brand: {
          $in: string[];
        };
      }
  >;
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      authorized: false,
      status: 401,
      error: "Not authenticated",
    };
  }

  if (session.user.role !== "admin") {
    return {
      authorized: false,
      status: 403,
      error: "Admin access required",
    };
  }

  return {
    authorized: true,
  };
}

// GET PRODUCTS
// Public: customers need access to products.
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const brand = searchParams.get("brand");
    const sort = searchParams.get("sort") || "newest";
    const search = searchParams.get("search");

    const minPriceValue = searchParams.get("minPrice");
    const maxPriceValue = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock");

    const filter: ProductFilter = {};

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

    // Price filter
    const minPrice = minPriceValue
      ? Number(minPriceValue)
      : undefined;

    const maxPrice = maxPriceValue
      ? Number(maxPriceValue)
      : undefined;

    if (
      (minPrice !== undefined && Number.isNaN(minPrice)) ||
      (maxPrice !== undefined && Number.isNaN(maxPrice))
    ) {
      return Response.json(
        {
          error: "Invalid price filter",
        },
        {
          status: 400,
        }
      );
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};

      if (minPrice !== undefined) {
        filter.price.$gte = minPrice;
      }

      if (maxPrice !== undefined) {
        filter.price.$lte = maxPrice;
      }
    }

    // Stock filter
    if (inStock === "true") {
      filter.stock = {
        $gt: 0,
      };
    }

    // Search by product name OR brand name
    if (search && search.trim() !== "") {
      const searchValue = search.trim();

      const Brand = (
        await import("@/models/Brand")
      ).default;

      const brands = await Brand.find({
        name: {
          $regex: searchValue,
          $options: "i",
        },
      }).select("_id");

      const brandIds = brands.map((item) =>
        item._id.toString()
      );

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
// Admin only.
export async function POST(request: NextRequest) {
  try {
    const authorization = await requireAdmin();

    if (!authorization.authorized) {
      return Response.json(
        {
          error: authorization.error,
        },
        {
          status: authorization.status,
        }
      );
    }

    await connectDB();

    const body =
      (await request.json()) as ProductCreateBody;

    if (
      !body.name ||
      !body.description ||
      typeof body.price !== "number" ||
      !Array.isArray(body.images)
    ) {
      return Response.json(
        {
          error: "Invalid product data",
        },
        {
          status: 400,
        }
      );
    }

    const product = await Product.create({
      name: body.name,
      description: body.description,
      price: body.price,
      discountPrice: body.discountPrice,
      images: body.images,
      category: body.category,
      subcategory: body.subcategory,
      brand: body.brand,
      stock: body.stock ?? 0,
      isActive: body.isActive ?? true,
    });

    const populatedProduct =
      await Product.findById(product._id)
        .populate("category")
        .populate("subcategory")
        .populate("brand");

    return Response.json(populatedProduct, {
      status: 201,
    });
  } catch (error) {
    console.error(
      "CREATE PRODUCT ERROR:",
      error
    );

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