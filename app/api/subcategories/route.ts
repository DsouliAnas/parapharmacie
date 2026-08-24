import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import Subcategory from "@/models/Subcategory";
import "@/models/Category";

interface CreateSubcategoryBody {
  name?: unknown;
  category?: unknown;
  image?: unknown;
}

function createSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/*
|--------------------------------------------------------------------------
| GET ALL SUBCATEGORIES
|--------------------------------------------------------------------------
| Public
*/

export async function GET(
  request: NextRequest
): Promise<Response> {
  try {
    await connectDB();

    const { searchParams } =
      new URL(request.url);

    const categoryId =
      searchParams.get("category");

    if (
      categoryId &&
      !mongoose.Types.ObjectId.isValid(categoryId)
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

    const filter: {
      category?: mongoose.Types.ObjectId;
    } = {};

    if (categoryId) {
      filter.category =
        new mongoose.Types.ObjectId(categoryId);
    }

    const subcategories =
      await Subcategory.find(filter)
        .populate(
          "category",
          "name slug"
        )
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

/*
|--------------------------------------------------------------------------
| CREATE SUBCATEGORY
|--------------------------------------------------------------------------
| Admin only
*/

export async function POST(
  request: NextRequest
): Promise<Response> {
  try {
    /*
     * AUTHENTICATION
     */

    const session =
      await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json(
        {
          error: "Not authenticated.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * AUTHORIZATION
     */

    if (session.user.role !== "admin") {
      return Response.json(
        {
          error: "Admin access required.",
        },
        {
          status: 403,
        }
      );
    }

    await connectDB();

    /*
     * PARSE BODY
     */

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        {
          error: "Invalid JSON body",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
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

    const data =
      body as CreateSubcategoryBody;

    /*
     * NAME
     */

    if (
      typeof data.name !== "string"
    ) {
      return Response.json(
        {
          error:
            "Le nom de la sous-catégorie est obligatoire.",
        },
        {
          status: 400,
        }
      );
    }

    const name = data.name.trim();

    if (
      name.length < 2 ||
      name.length > 100
    ) {
      return Response.json(
        {
          error:
            "Le nom doit contenir entre 2 et 100 caractères.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * CATEGORY
     */

    if (
      typeof data.category !== "string" ||
      !mongoose.Types.ObjectId.isValid(
        data.category
      )
    ) {
      return Response.json(
        {
          error:
            "Veuillez sélectionner une catégorie valide.",
        },
        {
          status: 400,
        }
      );
    }

    const categoryId =
      new mongoose.Types.ObjectId(
        data.category
      );

    const categoryExists =
      await mongoose
        .model("Category")
        .exists({
          _id: categoryId,
        });

    if (!categoryExists) {
      return Response.json(
        {
          error:
            "La catégorie sélectionnée n'existe pas.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * SLUG
     */

    const slug = createSlug(name);

    if (!slug) {
      return Response.json(
        {
          error:
            "Impossible de créer un slug valide.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * IMAGE
     */

    let image = "";

    if (
      data.image !== undefined
    ) {
      if (
        typeof data.image !== "string"
      ) {
        return Response.json(
          {
            error:
              "Invalid image value",
          },
          {
            status: 400,
          }
        );
      }

      image = data.image.trim();

      if (image.length > 2000) {
        return Response.json(
          {
            error:
              "Image URL is too long.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /*
     * CHECK DUPLICATE
     */

    const existing =
      await Subcategory.findOne({
        category: categoryId,
        slug,
      })
        .select("_id")
        .lean();

    if (existing) {
      return Response.json(
        {
          error:
            "Cette sous-catégorie existe déjà dans cette catégorie.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * CREATE
     */

    const subcategory =
      await Subcategory.create({
        name,
        slug,
        category: categoryId,
        image,
      });

    return Response.json(
      subcategory,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE SUBCATEGORY ERROR:",
      error
    );

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return Response.json(
        {
          error:
            "Cette sous-catégorie existe déjà dans cette catégorie.",
        },
        {
          status: 409,
        }
      );
    }

    return Response.json(
      {
        error:
          "Failed to create subcategory",
      },
      {
        status: 500,
      }
    );
  }
}