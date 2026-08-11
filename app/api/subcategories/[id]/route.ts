import { NextRequest } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Subcategory from "@/models/Subcategory";
import "@/models/Category";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

interface UpdateSubcategoryBody {
  name?: unknown;
  slug?: unknown;
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

// GET ONE SUBCATEGORY
export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        {
          error: "Invalid subcategory ID",
        },
        {
          status: 400,
        }
      );
    }

    const subcategory =
      await Subcategory.findById(id)
        .populate(
          "category",
          "name slug"
        )
        .lean();

    if (!subcategory) {
      return Response.json(
        {
          error: "Subcategory not found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(
      subcategory,
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET SUBCATEGORY ERROR:",
      error
    );

    return Response.json(
      {
        error:
          "Failed to get subcategory",
      },
      {
        status: 500,
      }
    );
  }
}

// UPDATE SUBCATEGORY
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        {
          error: "Invalid subcategory ID",
        },
        {
          status: 400,
        }
      );
    }

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
      body === null
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
      body as UpdateSubcategoryBody;

    const update: {
      name?: string;
      slug?: string;
      category?: mongoose.Types.ObjectId;
      image?: string;
    } = {};

    if (data.name !== undefined) {
      if (
        typeof data.name !== "string"
      ) {
        return Response.json(
          {
            error:
              "Invalid subcategory name",
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
              "Name must contain between 2 and 100 characters",
          },
          {
            status: 400,
          }
        );
      }

      update.name = name;

      if (data.slug === undefined) {
        update.slug = createSlug(name);
      }
    }

    if (data.slug !== undefined) {
      if (
        typeof data.slug !== "string"
      ) {
        return Response.json(
          {
            error:
              "Invalid subcategory slug",
          },
          {
            status: 400,
          }
        );
      }

      const slug = createSlug(
        data.slug.trim()
      );

      if (!slug) {
        return Response.json(
          {
            error:
              "Invalid subcategory slug",
          },
          {
            status: 400,
          }
        );
      }

      update.slug = slug;
    }

    if (data.category !== undefined) {
      if (
        typeof data.category !== "string" ||
        !mongoose.Types.ObjectId.isValid(
          data.category
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

      const categoryExists =
        await mongoose
          .model("Category")
          .exists({
            _id: data.category,
          });

      if (!categoryExists) {
        return Response.json(
          {
            error: "Category not found",
          },
          {
            status: 404,
          }
        );
      }

      update.category =
        new mongoose.Types.ObjectId(
          data.category
        );
    }

    if (data.image !== undefined) {
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

      update.image =
        data.image.trim();
    }

    if (
      Object.keys(update).length === 0
    ) {
      return Response.json(
        {
          error:
            "No fields to update",
        },
        {
          status: 400,
        }
      );
    }

    try {
      const subcategory =
        await Subcategory.findByIdAndUpdate(
          id,
          update,
          {
            new: true,
            runValidators: true,
          }
        )
          .populate(
            "category",
            "name slug"
          );

      if (!subcategory) {
        return Response.json(
          {
            error:
              "Subcategory not found",
          },
          {
            status: 404,
          }
        );
      }

      return Response.json(
        subcategory,
        {
          status: 200,
        }
      );
    } catch (error) {
      if (
        error instanceof mongoose.Error
      ) {
        if (
          "code" in error &&
          error.code === 11000
        ) {
          return Response.json(
            {
              error:
                "This subcategory already exists in this category",
            },
            {
              status: 409,
            }
          );
        }
      }

      throw error;
    }
  } catch (error) {
    console.error(
      "UPDATE SUBCATEGORY ERROR:",
      error
    );

    return Response.json(
      {
        error:
          "Failed to update subcategory",
      },
      {
        status: 500,
      }
    );
  }
}

// DELETE SUBCATEGORY
export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        {
          error: "Invalid subcategory ID",
        },
        {
          status: 400,
        }
      );
    }

    const subcategory =
      await Subcategory.findByIdAndDelete(id);

    if (!subcategory) {
      return Response.json(
        {
          error:
            "Subcategory not found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(
      {
        message:
          "Subcategory deleted successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "DELETE SUBCATEGORY ERROR:",
      error
    );

    return Response.json(
      {
        error:
          "Failed to delete subcategory",
      },
      {
        status: 500,
      }
    );
  }
}