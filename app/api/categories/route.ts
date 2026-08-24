import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";

interface CreateCategoryBody {
  name?: unknown;
  slug?: unknown;
  image?: unknown;
}

const MAX_BODY_SIZE = 100_000;
const MAX_NAME_LENGTH = 100;
const MAX_SLUG_LENGTH = 100;
const MAX_IMAGE_LENGTH = 500;

function isObject(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

function escapeRegex(value: string): string {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

function getContentLength(
  request: NextRequest
): number | null {
  const value =
    request.headers.get("content-length");

  if (!value) {
    return null;
  }

  const length = Number(value);

  return Number.isFinite(length)
    ? length
    : null;
}

function isAllowedOrigin(
  request: NextRequest
): boolean {
  const origin = request.headers.get("origin");

  // GET requests normally don't need an Origin header.
  // For mutation requests, absence is still allowed because
  // some legitimate clients/browsers may omit it.
  if (!origin) {
    return true;
  }

  const configuredOrigin =
    process.env.NEXTAUTH_URL?.replace(/\/$/, "");

  if (!configuredOrigin) {
    return false;
  }

  return (
    origin.replace(/\/$/, "") ===
    configuredOrigin
  );
}

async function requireAdmin(): Promise<Response | null> {
  const session =
    await getServerSession(authOptions);

  if (!session?.user?.id) {
    return Response.json(
      {
        error: "Non authentifié.",
      },
      {
        status: 401,
      }
    );
  }

  if (session.user.role !== "admin") {
    return Response.json(
      {
        error: "Accès refusé.",
      },
      {
        status: 403,
      }
    );
  }

  return null;
}

async function parseJsonBody(
  request: NextRequest
): Promise<
  | {
      success: true;
      body: Record<string, unknown>;
    }
  | {
      success: false;
      response: Response;
    }
> {
  const contentLength =
    getContentLength(request);

  if (
    contentLength !== null &&
    contentLength > MAX_BODY_SIZE
  ) {
    return {
      success: false,
      response: Response.json(
        {
          error: "Requête trop volumineuse.",
        },
        {
          status: 413,
        }
      ),
    };
  }

  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    return {
      success: false,
      response: Response.json(
        {
          error: "JSON invalide.",
        },
        {
          status: 400,
        }
      ),
    };
  }

  if (!isObject(rawBody)) {
    return {
      success: false,
      response: Response.json(
        {
          error: "Corps de requête invalide.",
        },
        {
          status: 400,
        }
      ),
    };
  }

  return {
    success: true,
    body: rawBody,
  };
}

function validateName(
  value: unknown
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const name = value.trim();

  if (!name) {
    return null;
  }

  if (name.length > MAX_NAME_LENGTH) {
    return null;
  }

  return name;
}

function validateSlug(
  value: unknown
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const slug = value.trim().toLowerCase();

  if (!slug) {
    return null;
  }

  if (slug.length > MAX_SLUG_LENGTH) {
    return null;
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return null;
  }

  return slug;
}

function validateImage(
  value: unknown
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const image = value.trim();

  if (!image) {
    return null;
  }

  if (image.length > MAX_IMAGE_LENGTH) {
    return null;
  }

  /*
   * Allow:
   *
   * /images/category.jpg
   * /uploads/category.webp
   * https://...
   *
   * Reject:
   *
   * javascript:
   * data:
   * file:
   * vbscript:
   */
  if (
    image.startsWith("/") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  return null;
}

/*
 * GET ALL CATEGORIES
 *
 * Public.
 */
export async function GET(): Promise<Response> {
  try {
    await connectDB();

    const categories =
      await Category.find({})
        .select("_id name slug image")
        .sort({ name: 1 })
        .lean();

    return Response.json(categories);
  } catch (error) {
    console.error(
      "GET CATEGORIES ERROR:",
      error
    );

    return Response.json(
      {
        error:
          "Impossible de récupérer les catégories.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * CREATE CATEGORY
 *
 * ADMIN ONLY.
 */
export async function POST(
  request: NextRequest
): Promise<Response> {
  try {
    const authorizationError =
      await requireAdmin();

    if (authorizationError) {
      return authorizationError;
    }

    if (!isAllowedOrigin(request)) {
      return Response.json(
        {
          error:
            "Origine de requête non autorisée.",
        },
        {
          status: 403,
        }
      );
    }

    const parsed =
      await parseJsonBody(request);

    if (!parsed.success) {
      return parsed.response;
    }

    const body: CreateCategoryBody =
      parsed.body;

    const name = validateName(body.name);
    const slug = validateSlug(body.slug);
    const image = validateImage(body.image);

    if (!name) {
      return Response.json(
        {
          error:
            "Le nom de la catégorie est invalide.",
        },
        {
          status: 400,
        }
      );
    }

    if (!slug) {
      return Response.json(
        {
          error: "Le slug est invalide.",
        },
        {
          status: 400,
        }
      );
    }

    if (!image) {
      return Response.json(
        {
          error:
            "L'image de la catégorie est invalide.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    /*
     * Case-insensitive duplicate check for name.
     */
    const duplicate =
      await Category.findOne({
        $or: [
          {
            name: {
              $regex: `^${escapeRegex(name)}$`,
              $options: "i",
            },
          },
          {
            slug,
          },
        ],
      })
        .select("_id")
        .lean();

    if (duplicate) {
      return Response.json(
        {
          error:
            "Une catégorie avec ce nom ou ce slug existe déjà.",
        },
        {
          status: 409,
        }
      );
    }

    const category =
      await Category.create({
        name,
        slug,
        image,
      });

    return Response.json(
      {
        _id: String(category._id),
        name: category.name,
        slug: category.slug,
        image: category.image,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE CATEGORY ERROR:",
      error
    );

    /*
     * MongoDB duplicate-key protection.
     * This protects against race conditions where
     * two requests pass the duplicate check simultaneously.
     */
    if (
      isObject(error) &&
      "code" in error &&
      error.code === 11000
    ) {
      return Response.json(
        {
          error:
            "Une catégorie avec ce nom ou ce slug existe déjà.",
        },
        {
          status: 409,
        }
      );
    }

    return Response.json(
      {
        error:
          "Impossible de créer la catégorie.",
      },
      {
        status: 500,
      }
    );
  }
}