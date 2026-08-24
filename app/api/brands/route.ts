import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Brand from "@/models/Brand";

interface CreateBrandBody {
  name?: unknown;
  logo?: unknown;
}

interface ValidCreateBrandBody {
  name: string;
  logo?: string;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isCreateBrandBody(
  body: CreateBrandBody
): body is ValidCreateBrandBody {
  if (typeof body.name !== "string") {
    return false;
  }

  const name = body.name.trim();

  if (!name || name.length > 100) {
    return false;
  }

  if (
    body.logo !== undefined &&
    body.logo !== null &&
    typeof body.logo !== "string"
  ) {
    return false;
  }

  if (
    typeof body.logo === "string" &&
    body.logo.trim().length > 1000
  ) {
    return false;
  }

  return true;
}

/*
 * GET ALL BRANDS
 *
 * Public endpoint.
 */
export async function GET(): Promise<Response> {
  try {
    await connectDB();

    const brands = await Brand.find({})
      .select("_id name logo")
      .sort({ name: 1 })
      .lean();

    return Response.json(brands);
  } catch (error) {
    console.error("GET BRANDS ERROR:", error);

    return Response.json(
      {
        error: "Failed to fetch brands",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * CREATE BRAND
 *
 * ADMIN ONLY.
 */
export async function POST(
  request: NextRequest
): Promise<Response> {
  try {
    /*
     * Authentication
     */
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

    /*
     * Authorization
     */
    if (session.user.role !== "admin") {
      return Response.json(
        {
          error: "Forbidden",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * Basic request-size protection.
     */
    const contentLength =
      request.headers.get("content-length");

    if (
      contentLength &&
      Number.isFinite(Number(contentLength)) &&
      Number(contentLength) > 100_000
    ) {
      return Response.json(
        {
          error: "Request too large",
        },
        {
          status: 413,
        }
      );
    }

    /*
     * Parse JSON safely.
     */
    let rawBody: unknown;

    try {
      rawBody = await request.json();
    } catch {
      return Response.json(
        {
          error: "Invalid JSON body.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Body must be a plain object.
     */
    if (
      typeof rawBody !== "object" ||
      rawBody === null ||
      Array.isArray(rawBody)
    ) {
      return Response.json(
        {
          error: "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    const body = rawBody as CreateBrandBody;

    /*
     * Validation + TypeScript narrowing.
     */
    if (!isCreateBrandBody(body)) {
      return Response.json(
        {
          error:
            "Le nom de la marque est obligatoire et valide. Le logo est optionnel.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * At this point TypeScript KNOWS:
     *
     * body.name -> string
     * body.logo -> string | undefined
     */
    const name = body.name.trim();

    const logo =
      typeof body.logo === "string"
        ? body.logo.trim()
        : "";

    await connectDB();

    /*
     * Prevent duplicate names, case-insensitive.
     */
    const existingBrand =
      await Brand.findOne({
        name: {
          $regex: `^${escapeRegex(name)}$`,
          $options: "i",
        },
      })
        .select("_id")
        .lean();

    if (existingBrand) {
      return Response.json(
        {
          error: "Cette marque existe déjà.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * Create brand.
     */
    const brand = await Brand.create({
      name,
      logo,
    });

    return Response.json(
      {
        _id: String(brand._id),
        name: brand.name,
        logo: brand.logo,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("CREATE BRAND ERROR:", error);

    return Response.json(
      {
        error: "Failed to create brand",
      },
      {
        status: 500,
      }
    );
  }
}