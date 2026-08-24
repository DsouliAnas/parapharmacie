import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Brand from "@/models/Brand";

interface UpdateBrandBody {
  name?: unknown;
  logo?: unknown;
}

interface ValidUpdateBrandBody {
  name?: string;
  logo?: string | null;
}

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

function isUpdateBrandBody(
  body: UpdateBrandBody
): body is ValidUpdateBrandBody {
  const allowedFields = new Set([
    "name",
    "logo",
  ]);

  for (const key of Object.keys(body)) {
    if (!allowedFields.has(key)) {
      return false;
    }
  }

  if (
    body.name === undefined &&
    body.logo === undefined
  ) {
    return false;
  }

  if (body.name !== undefined) {
    if (typeof body.name !== "string") {
      return false;
    }

    const name = body.name.trim();

    if (!name || name.length > 100) {
      return false;
    }
  }

  if (body.logo !== undefined) {
    if (
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
  }

  return true;
}

async function requireAdmin(): Promise<
  Response | null
> {
  const session =
    await getServerSession(authOptions);

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
        error: "Forbidden",
      },
      {
        status: 403,
      }
    );
  }

  return null;
}

async function readJsonBody(
  request: NextRequest
): Promise<unknown | Response> {
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

  try {
    return await request.json();
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
}

/*
 * GET ONE BRAND
 *
 * Public.
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<Response> {
  try {
    const { id } = await context.params;

    if (!isValidObjectId(id)) {
      return Response.json(
        {
          error: "Invalid brand ID",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const brand = await Brand.findById(id)
      .select("_id name logo")
      .lean();

    if (!brand) {
      return Response.json(
        {
          error: "Brand not found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(brand);
  } catch (error) {
    console.error("GET BRAND ERROR:", error);

    return Response.json(
      {
        error: "Failed to get brand",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * UPDATE BRAND
 *
 * ADMIN ONLY.
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  try {
    const authError = await requireAdmin();

    if (authError) {
      return authError;
    }

    const { id } = await context.params;

    if (!isValidObjectId(id)) {
      return Response.json(
        {
          error: "Invalid brand ID",
        },
        {
          status: 400,
        }
      );
    }

    const rawBody = await readJsonBody(request);

    if (rawBody instanceof Response) {
      return rawBody;
    }

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

    const body =
      rawBody as UpdateBrandBody;

    if (!isUpdateBrandBody(body)) {
      return Response.json(
        {
          error: "Invalid brand data.",
        },
        {
          status: 400,
        }
      );
    }

    const updateData: {
      name?: string;
      logo?: string;
    } = {};

    if (body.name !== undefined) {
      updateData.name = body.name.trim();
    }

    if (body.logo !== undefined) {
      updateData.logo =
        body.logo === null
          ? ""
          : body.logo.trim();
    }

    await connectDB();

    /*
     * Check duplicate name.
     */
    if (updateData.name) {
      const duplicate =
        await Brand.findOne({
          _id: {
            $ne: id,
          },
          name: {
            $regex: `^${escapeRegex(
              updateData.name
            )}$`,
            $options: "i",
          },
        })
          .select("_id")
          .lean();

      if (duplicate) {
        return Response.json(
          {
            error:
              "Une autre marque utilise déjà ce nom.",
          },
          {
            status: 409,
          }
        );
      }
    }

    const brand =
      await Brand.findByIdAndUpdate(
        id,
        {
          $set: updateData,
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .select("_id name logo")
        .lean();

    if (!brand) {
      return Response.json(
        {
          error: "Brand not found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(brand);
  } catch (error) {
    console.error("UPDATE BRAND ERROR:", error);

    return Response.json(
      {
        error: "Update failed",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * DELETE BRAND
 *
 * ADMIN ONLY.
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
): Promise<Response> {
  try {
    const authError = await requireAdmin();

    if (authError) {
      return authError;
    }

    const { id } = await context.params;

    if (!isValidObjectId(id)) {
      return Response.json(
        {
          error: "Invalid brand ID",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const brand =
      await Brand.findByIdAndDelete(id);

    if (!brand) {
      return Response.json(
        {
          error: "Brand not found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json({
      message: "Brand deleted",
    });
  } catch (error) {
    console.error("DELETE BRAND ERROR:", error);

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