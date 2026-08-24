import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";

interface UpdateCategoryBody {
  name?: unknown;
  slug?: unknown;
  image?: unknown;
}

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
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

function isAllowedOrigin(
  request: NextRequest
): boolean {
  const origin = request.headers.get("origin");

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
    request.headers.get("content-length");

  if (contentLength) {
    const length = Number(contentLength);

    if (
      Number.isFinite(length) &&
      length > MAX_BODY_SIZE
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

  if (
    !name ||
    name.length > MAX_NAME_LENGTH
  ) {
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

  if (
    !slug ||
    slug.length > MAX_SLUG_LENGTH
  ) {
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

  if (
    !image ||
    image.length > MAX_IMAGE_LENGTH
  ) {
    return null;
  }

  if (
    image.startsWith("/") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  return null;
}

/*
 * GET ONE CATEGORY
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
          error:
            "Identifiant de catégorie invalide.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const category =
      await Category.findById(id)
        .select(
          "_id name slug image createdAt updatedAt"
        )
        .lean();

    if (!category) {
      return Response.json(
        {
          error: "Catégorie introuvable.",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(category);
  } catch (error) {
    console.error(
      "GET CATEGORY ERROR:",
      error
    );

    return Response.json(
      {
        error:
          "Impossible de récupérer la catégorie.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * UPDATE CATEGORY
 *
 * ADMIN ONLY.
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
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

    const { id } = await context.params;

    if (!isValidObjectId(id)) {
      return Response.json(
        {
          error:
            "Identifiant de catégorie invalide.",
        },
        {
          status: 400,
        }
      );
    }

    const parsed =
      await parseJsonBody(request);

    if (!parsed.success) {
      return parsed.response;
    }

    const body: UpdateCategoryBody =
      parsed.body;

    const allowedFields = new Set([
      "name",
      "slug",
      "image",
    ]);

    for (const key of Object.keys(body)) {
      if (!allowedFields.has(key)) {
        return Response.json(
          {
            error: `Champ non autorisé: ${key}`,
          },
          {
            status: 400,
          }
        );
      }
    }

    const update: {
      name?: string;
      slug?: string;
      image?: string;
    } = {};

    if (body.name !== undefined) {
      const name = validateName(body.name);

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

      update.name = name;
    }

    if (body.slug !== undefined) {
      const slug = validateSlug(body.slug);

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

      update.slug = slug;
    }

    if (body.image !== undefined) {
      const image = validateImage(body.image);

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

      update.image = image;
    }

    if (Object.keys(update).length === 0) {
      return Response.json(
        {
          error:
            "Aucune modification valide fournie.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    /*
     * Case-insensitive name duplicate check.
     */
    const duplicateConditions: Array<
      Record<string, unknown>
    > = [];

    if (update.name) {
      duplicateConditions.push({
        name: {
          $regex: `^${escapeRegex(
            update.name
          )}$`,
          $options: "i",
        },
      });
    }

    if (update.slug) {
      duplicateConditions.push({
        slug: update.slug,
      });
    }

    if (duplicateConditions.length > 0) {
      const duplicate =
        await Category.findOne({
          _id: {
            $ne: id,
          },
          $or: duplicateConditions,
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
    }

    const category =
      await Category.findByIdAndUpdate(
        id,
        {
          $set: update,
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .select(
          "_id name slug image createdAt updatedAt"
        )
        .lean();

    if (!category) {
      return Response.json(
        {
          error: "Catégorie introuvable.",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(category);
  } catch (error) {
    console.error(
      "UPDATE CATEGORY ERROR:",
      error
    );

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
          "Impossible de mettre à jour la catégorie.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * DELETE CATEGORY
 *
 * ADMIN ONLY.
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
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

    const { id } = await context.params;

    if (!isValidObjectId(id)) {
      return Response.json(
        {
          error:
            "Identifiant de catégorie invalide.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const deleted =
      await Category.findByIdAndDelete(id);

    if (!deleted) {
      return Response.json(
        {
          error: "Catégorie introuvable.",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json({
      message:
        "Catégorie supprimée avec succès.",
    });
  } catch (error) {
    console.error(
      "DELETE CATEGORY ERROR:",
      error
    );

    return Response.json(
      {
        error:
          "Impossible de supprimer la catégorie.",
      },
      {
        status: 500,
      }
    );
  }
}