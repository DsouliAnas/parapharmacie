import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Subcategory from "@/models/Subcategory";
import "@/models/Category";

// GET ONE SUBCATEGORY

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

    const subcategory = await Subcategory.findById(id)
      .populate("category", "name slug");

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

    return Response.json(subcategory);
  } catch (error) {
    console.error("GET SUBCATEGORY ERROR:", error);

    return Response.json(
      {
        error: "Failed to get subcategory",
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
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await connectDB();

    const { id } = await context.params;

    const body = await request.json();

    const subcategory = await Subcategory.findByIdAndUpdate(
      id,
      body,
      {
        new: true,
        runValidators: true,
      }
    );

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

    return Response.json(subcategory);
  } catch (error) {
    console.error("UPDATE SUBCATEGORY ERROR:", error);

    return Response.json(
      {
        error: "Failed to update subcategory",
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
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await connectDB();

    const { id } = await context.params;

    const subcategory =
      await Subcategory.findByIdAndDelete(id);

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

    return Response.json({
      message: "Subcategory deleted",
    });
  } catch (error) {
    console.error("DELETE SUBCATEGORY ERROR:", error);

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