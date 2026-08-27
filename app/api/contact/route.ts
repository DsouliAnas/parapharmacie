import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      firstName,
      lastName,
      email,
      message,
    } = body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !message
    ) {
      return NextResponse.json(
        { error: "Tous les champs sont obligatoires." },
        { status: 400 }
      );
    }

    const newMessage =
      await ContactMessage.create({
        firstName,
        lastName,
        email,
        message,
      });

    return NextResponse.json(
      newMessage,
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}