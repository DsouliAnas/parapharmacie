import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID de message invalide." },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (
      typeof body.isRead !== "boolean"
    ) {
      return NextResponse.json(
        { error: "isRead doit être un booléen." },
        { status: 400 }
      );
    }

    const message =
      await ContactMessage.findByIdAndUpdate(
        id,
        {
          isRead: body.isRead,
        },
        {
          new: true,
        }
      ).lean();

    if (!message) {
      return NextResponse.json(
        { error: "Message introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error(
      "PATCH /api/admin/messages/[id] error:",
      error
    );

    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID de message invalide." },
        { status: 400 }
      );
    }

    const deletedMessage =
      await ContactMessage.findByIdAndDelete(id);

    if (!deletedMessage) {
      return NextResponse.json(
        { error: "Message introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Message supprimé.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/admin/messages/[id] error:",
      error
    );

    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}