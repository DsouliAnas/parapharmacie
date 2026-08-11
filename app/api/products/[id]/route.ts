import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

import "@/models/Category";
import "@/models/Subcategory";
import "@/models/Brand";

import { authOptions } from "@/lib/auth";

interface ProductUpdateBody {
  name?: string;
  description?: string;
  price?: number;
  discountPrice?: number;
  images?: string[];
  category?: string;
  subcategory?: string;
  brand?: string;
  stock?: number;
  isActive?: boolean;
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

// GET ONE PRODUCT
// Public.
export async function GET(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await connectDB();

    const { id } = await context.params;

    const product = await Product.findById(id)
      .populate("category")
      .populate("subcategory")
      .populate("brand");

    if (!product) {
      return Response.json(
        {
          error: "Product not found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(product);
  } catch (error) {
    console.error(
      "GET PRODUCT ERROR:",
      error
    );

    return Response.json(
      {
        error: "Failed to get product",
      },
      {
        status: 500,
      }
    );
  }
}

// UPDATE PRODUCT
// Admin only.
export async function PUT(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
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

    const { id } = await context.params;

    const body =
      (await request.json()) as ProductUpdateBody;

    const allowedUpdates: ProductUpdateBody = {};

    if (body.name !== undefined) {
      allowedUpdates.name = body.name;
    }

    if (body.description !== undefined) {
      allowedUpdates.description =
        body.description;
    }

    if (body.price !== undefined) {
      allowedUpdates.price = body.price;
    }

    if (body.discountPrice !== undefined) {
      allowedUpdates.discountPrice =
        body.discountPrice;
    }

    if (body.images !== undefined) {
      allowedUpdates.images = body.images;
    }

    if (body.category !== undefined) {
      allowedUpdates.category = body.category;
    }

    if (body.subcategory !== undefined) {
      allowedUpdates.subcategory =
        body.subcategory;
    }

    if (body.brand !== undefined) {
      allowedUpdates.brand = body.brand;
    }

    if (body.stock !== undefined) {
      allowedUpdates.stock = body.stock;
    }

    if (body.isActive !== undefined) {
      allowedUpdates.isActive = body.isActive;
    }

    const product =
      await Product.findByIdAndUpdate(
        id,
        allowedUpdates,
        {
          new: true,
          runValidators: true,
        }
      )
        .populate("category")
        .populate("subcategory")
        .populate("brand");

    if (!product) {
      return Response.json(
        {
          error: "Product not found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(product);
  } catch (error) {
    console.error(
      "UPDATE PRODUCT ERROR:",
      error
    );

    return Response.json(
      {
        error: "Failed to update product",
      },
      {
        status: 500,
      }
    );
  }
}

// DELETE PRODUCT
// Admin only.
export async function DELETE(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
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

    const { id } = await context.params;

    const product =
      await Product.findByIdAndDelete(id);

    if (!product) {
      return Response.json(
        {
          error: "Product not found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json({
      message: "Product deleted",
    });
  } catch (error) {
    console.error(
      "DELETE PRODUCT ERROR:",
      error
    );

    return Response.json(
      {
        error: "Delete failed",
      },
      {
        status: 500,
      }
    );
  }
}