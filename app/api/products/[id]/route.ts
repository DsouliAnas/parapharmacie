import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

import "@/models/Category";
import "@/models/Subcategory";
import "@/models/Brand";

import { authOptions } from "@/lib/auth";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

interface ProductUpdateBody {
  name?: unknown;
  description?: unknown;
  benefits?: unknown;
  usage?: unknown;
  price?: unknown;
  discountPrice?: unknown;
  images?: unknown;
  category?: unknown;
  subcategory?: unknown;
  brand?: unknown;
  stock?: unknown;
  isActive?: unknown;
}

interface ProductUpdate {
  name?: string;
  description?: string;
  benefits?: string[];
  usage?: string[];
  price?: number;
  discountPrice?: number;
  images?: string[];
  category?: string;
  subcategory?: string;
  brand?: string;
  stock?: number;
  isActive?: boolean;
}

/*
|--------------------------------------------------------------------------
| ADMIN AUTHENTICATION
|--------------------------------------------------------------------------
*/

async function requireAdmin(): Promise<Response | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return Response.json(
      {
        error: "Not authenticated",
      },
      {
        status: 401,
      }
    );
  }

  if (session.user.role !== "admin") {
    return Response.json(
      {
        error: "Admin access required",
      },
      {
        status: 403,
      }
    );
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| VALIDATE PRODUCT ID
|--------------------------------------------------------------------------
*/

function isValidProductId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

/*
|--------------------------------------------------------------------------
| VALIDATE STRING
|--------------------------------------------------------------------------
*/

function cleanString(
  value: unknown,
  maxLength: number
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.trim();

  if (!cleaned || cleaned.length > maxLength) {
    return null;
  }

  return cleaned;
}

/*
|--------------------------------------------------------------------------
| VALIDATE STRING ARRAY
|--------------------------------------------------------------------------
*/

function cleanStringArray(
  value: unknown,
  maxItems: number,
  maxItemLength: number
): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  if (value.length > maxItems) {
    return null;
  }

  const result: string[] = [];

  for (const item of value) {
    if (typeof item !== "string") {
      return null;
    }

    const cleaned = item.trim();

    if (
      !cleaned ||
      cleaned.length > maxItemLength
    ) {
      return null;
    }

    result.push(cleaned);
  }

  return result;
}

/*
|--------------------------------------------------------------------------
| VALIDATE NUMBER
|--------------------------------------------------------------------------
*/

function cleanNumber(
  value: unknown,
  minimum: number
): number | null {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < minimum
  ) {
    return null;
  }

  return value;
}

/*
|--------------------------------------------------------------------------
| VALIDATE OPTIONAL OBJECT ID
|--------------------------------------------------------------------------
*/

function cleanObjectId(
  value: unknown
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.trim();

  if (
    !cleaned ||
    !mongoose.Types.ObjectId.isValid(cleaned)
  ) {
    return null;
  }

  return cleaned;
}

/*
|--------------------------------------------------------------------------
| GET ONE PRODUCT
|--------------------------------------------------------------------------
| Public
|--------------------------------------------------------------------------
*/

export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<Response> {
  try {
    const { id } = await context.params;

    if (!isValidProductId(id)) {
      return Response.json(
        {
          error: "Invalid product ID",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const product = await Product.findById(id)
      .populate(
        "category",
        "name slug"
      )
      .populate(
        "subcategory",
        "name slug"
      )
      .populate(
        "brand",
        "name logo"
      )
      .lean();

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

/*
|--------------------------------------------------------------------------
| UPDATE PRODUCT
|--------------------------------------------------------------------------
| Admin only
|--------------------------------------------------------------------------
*/

export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  try {
    /*
    |--------------------------------------------------------------------------
    | 1. ADMIN CHECK
    |--------------------------------------------------------------------------
    */

    const authorizationError =
      await requireAdmin();

    if (authorizationError) {
      return authorizationError;
    }

    /*
    |--------------------------------------------------------------------------
    | 2. PRODUCT ID
    |--------------------------------------------------------------------------
    */

    const { id } = await context.params;

    if (!isValidProductId(id)) {
      return Response.json(
        {
          error: "Invalid product ID",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 3. READ JSON
    |--------------------------------------------------------------------------
    */

    let body: ProductUpdateBody;

    try {
      const rawBody: unknown =
        await request.json();

      if (
        typeof rawBody !== "object" ||
        rawBody === null ||
        Array.isArray(rawBody)
      ) {
        return Response.json(
          {
            error: "Invalid request body",
          },
          {
            status: 400,
          }
        );
      }

      body =
        rawBody as ProductUpdateBody;
    } catch {
      return Response.json(
        {
          error: "Invalid JSON",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 4. WHITELIST UPDATE FIELDS
    |--------------------------------------------------------------------------
    */

    const update: ProductUpdate = {};
    const unset: Record<string, 1> = {};

    /*
    |--------------------------------------------------------------------------
    | NAME
    |--------------------------------------------------------------------------
    */

    if (body.name !== undefined) {
      const name = cleanString(
        body.name,
        200
      );

      if (!name) {
        return Response.json(
          {
            error:
              "Product name is invalid",
          },
          {
            status: 400,
          }
        );
      }

      update.name = name;
    }

    /*
    |--------------------------------------------------------------------------
    | DESCRIPTION
    |--------------------------------------------------------------------------
    */

    if (body.description !== undefined) {
      const description =
        cleanString(
          body.description,
          5000
        );

      if (!description) {
        return Response.json(
          {
            error:
              "Product description is invalid",
          },
          {
            status: 400,
          }
        );
      }

      update.description =
        description;
    }

    /*
    |--------------------------------------------------------------------------
    | BENEFITS
    |--------------------------------------------------------------------------
    */

    if (body.benefits !== undefined) {
      const benefits =
        cleanStringArray(
          body.benefits,
          50,
          500
        );

      if (!benefits) {
        return Response.json(
          {
            error:
              "Product benefits are invalid",
          },
          {
            status: 400,
          }
        );
      }

      update.benefits = benefits;
    }

    /*
    |--------------------------------------------------------------------------
    | USAGE
    |--------------------------------------------------------------------------
    */

    if (body.usage !== undefined) {
      const usage =
        cleanStringArray(
          body.usage,
          50,
          500
        );

      if (!usage) {
        return Response.json(
          {
            error:
              "Product usage information is invalid",
          },
          {
            status: 400,
          }
        );
      }

      update.usage = usage;
    }

    /*
    |--------------------------------------------------------------------------
    | PRICE
    |--------------------------------------------------------------------------
    */

    if (body.price !== undefined) {
      const price = cleanNumber(
        body.price,
        0
      );

      if (price === null) {
        return Response.json(
          {
            error:
              "Product price is invalid",
          },
          {
            status: 400,
          }
        );
      }

      update.price = price;
    }

    /*
    |--------------------------------------------------------------------------
    | DISCOUNT PRICE
    |--------------------------------------------------------------------------
    */

if (body.discountPrice !== undefined) {
  if (body.discountPrice === null) {
    unset.discountPrice = 1;
  } else {
    const discountPrice = cleanNumber(
      body.discountPrice,
      0
    );

    if (discountPrice === null) {
      return Response.json(
        {
          error: "Discount price is invalid",
        },
        {
          status: 400,
        }
      );
    }

    update.discountPrice = discountPrice;
  }
}

    /*
    |--------------------------------------------------------------------------
    | IMAGES
    |--------------------------------------------------------------------------
    */

    if (body.images !== undefined) {
      const images =
        cleanStringArray(
          body.images,
          20,
          1000
        );

      if (!images) {
        return Response.json(
          {
            error:
              "Product images are invalid",
          },
          {
            status: 400,
          }
        );
      }

      update.images = images;
    }

    /*
    |--------------------------------------------------------------------------
    | CATEGORY
    |--------------------------------------------------------------------------
    */

    if (
      body.category !== undefined
    ) {
      const category =
        cleanObjectId(
          body.category
        );

      if (!category) {
        return Response.json(
          {
            error:
              "Category ID is invalid",
          },
          {
            status: 400,
          }
        );
      }

      update.category = category;
    }

    /*
    |--------------------------------------------------------------------------
    | SUBCATEGORY
    |--------------------------------------------------------------------------
    */

    if (
      body.subcategory !== undefined
    ) {
      const subcategory =
        cleanObjectId(
          body.subcategory
        );

      if (!subcategory) {
        return Response.json(
          {
            error:
              "Subcategory ID is invalid",
          },
          {
            status: 400,
          }
        );
      }

      update.subcategory =
        subcategory;
    }

    /*
    |--------------------------------------------------------------------------
    | BRAND
    |--------------------------------------------------------------------------
    */

    if (body.brand !== undefined) {
      const brand =
        cleanObjectId(
          body.brand
        );

      if (!brand) {
        return Response.json(
          {
            error:
              "Brand ID is invalid",
          },
          {
            status: 400,
          }
        );
      }

      update.brand = brand;
    }

    /*
    |--------------------------------------------------------------------------
    | STOCK
    |--------------------------------------------------------------------------
    */

    if (body.stock !== undefined) {
      const stock = cleanNumber(
        body.stock,
        0
      );

      if (
        stock === null ||
        !Number.isInteger(stock)
      ) {
        return Response.json(
          {
            error:
              "Stock must be a positive integer or zero",
          },
          {
            status: 400,
          }
        );
      }

      update.stock = stock;
    }

    /*
    |--------------------------------------------------------------------------
    | ACTIVE STATUS
    |--------------------------------------------------------------------------
    */

    if (
      body.isActive !== undefined
    ) {
      if (
        typeof body.isActive !==
        "boolean"
      ) {
        return Response.json(
          {
            error:
              "isActive must be a boolean",
          },
          {
            status: 400,
          }
        );
      }

      update.isActive =
        body.isActive;
    }

    /*
    |--------------------------------------------------------------------------
    | 5. PREVENT EMPTY UPDATE
    |--------------------------------------------------------------------------
    */

 if (
  Object.keys(update).length === 0 &&
  Object.keys(unset).length === 0
) {
  return Response.json(
    {
      error: "No valid changes provided",
    },
    {
      status: 400,
    }
  );
}

    /*
    |--------------------------------------------------------------------------
    | 6. CHECK PRODUCT EXISTS
    |--------------------------------------------------------------------------
    */

    await connectDB();

    const existingProduct =
      await Product.findById(id)
        .select("_id price");

    if (!existingProduct) {
      return Response.json(
        {
          error: "Product not found",
        },
        {
          status: 404,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 7. DISCOUNT PRICE VALIDATION
    |--------------------------------------------------------------------------
    */

    const finalPrice =
      update.price ??
      existingProduct.price;

    if (
      update.discountPrice !==
        undefined &&
      update.discountPrice >
        finalPrice
    ) {
      return Response.json(
        {
          error:
            "Discount price cannot be greater than the regular price",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 8. UPDATE
    |--------------------------------------------------------------------------
    */

    const updateOperations: {
  $set?: ProductUpdate;
  $unset?: Record<string, 1>;
} = {};

if (Object.keys(update).length > 0) {
  updateOperations.$set = update;
}

if (Object.keys(unset).length > 0) {
  updateOperations.$unset = unset;
}

const product =
  await Product.findByIdAndUpdate(
    id,
    updateOperations,
    {
      new: true,
      runValidators: true,
    }
  )
        .populate(
          "category",
          "name slug"
        )
        .populate(
          "subcategory",
          "name slug"
        )
        .populate(
          "brand",
          "name logo"
        )
        .lean();

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
        error:
          "Failed to update product",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| DELETE PRODUCT
|--------------------------------------------------------------------------
| Admin only
|--------------------------------------------------------------------------
*/

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
): Promise<Response> {
  try {
    /*
    |--------------------------------------------------------------------------
    | 1. ADMIN CHECK
    |--------------------------------------------------------------------------
    */

    const authorizationError =
      await requireAdmin();

    if (authorizationError) {
      return authorizationError;
    }

    /*
    |--------------------------------------------------------------------------
    | 2. PRODUCT ID
    |--------------------------------------------------------------------------
    */

    const { id } = await context.params;

    if (!isValidProductId(id)) {
      return Response.json(
        {
          error: "Invalid product ID",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 3. CONNECT DATABASE
    |--------------------------------------------------------------------------
    */

    await connectDB();

    /*
    |--------------------------------------------------------------------------
    | 4. DELETE
    |--------------------------------------------------------------------------
    */

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
      success: true,
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