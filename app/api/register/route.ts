import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

interface RegisterBody {
  name?: unknown;
  email?: unknown;
  password?: unknown;
  phone?: unknown;
  address?: unknown;
  city?: unknown;
  postalCode?: unknown;
}

function isString(
  value: unknown
): value is string {
  return typeof value === "string";
}

function isValidEmail(
  email: string
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

export async function POST(
  request: NextRequest
): Promise<Response> {
  try {
    /*
     * Read the request body safely.
     */
    let body: RegisterBody;

    try {
      body =
        (await request.json()) as RegisterBody;
    } catch {
      return Response.json(
        {
          error:
            "Requête invalide.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Validate required fields.
     *
     * We deliberately use unknown first instead
     * of trusting the browser's JSON.
     */
    if (
      !isString(body.name) ||
      !isString(body.email) ||
      !isString(body.password)
    ) {
      return Response.json(
        {
          error:
            "Le nom, l'email et le mot de passe sont obligatoires.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Normalize the values.
     */
    const name = body.name.trim();

    const email =
      body.email
        .trim()
        .toLowerCase();

    const password =
      body.password;

    /*
     * Validate name.
     */
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
     * Validate email length.
     */
    if (
      email.length === 0 ||
      email.length > 254
    ) {
      return Response.json(
        {
          error:
            "Adresse email invalide.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Validate email format.
     */
    if (!isValidEmail(email)) {
      return Response.json(
        {
          error:
            "Adresse email invalide.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Password length.
     *
     * We intentionally don't impose complicated
     * character rules here.
     *
     * A good password can contain spaces and
     * special characters.
     */
    if (
      password.length < 8 ||
      password.length > 128
    ) {
      return Response.json(
        {
          error:
            "Le mot de passe doit contenir entre 8 et 128 caractères.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Optional fields.
     */
    let phone: string | undefined;
    let address: string | undefined;
    let city: string | undefined;
    let postalCode: string | undefined;

    if (body.phone !== undefined) {
      if (!isString(body.phone)) {
        return Response.json(
          {
            error:
              "Numéro de téléphone invalide.",
          },
          {
            status: 400,
          }
        );
      }

      phone =
        body.phone.trim();

      if (phone.length > 30) {
        return Response.json(
          {
            error:
              "Numéro de téléphone invalide.",
          },
          {
            status: 400,
          }
        );
      }
    }

    if (body.address !== undefined) {
      if (!isString(body.address)) {
        return Response.json(
          {
            error:
              "Adresse invalide.",
          },
          {
            status: 400,
          }
        );
      }

      address =
        body.address.trim();

      if (address.length > 300) {
        return Response.json(
          {
            error:
              "Adresse invalide.",
          },
          {
            status: 400,
          }
        );
      }
    }

    if (body.city !== undefined) {
      if (!isString(body.city)) {
        return Response.json(
          {
            error:
              "Ville invalide.",
          },
          {
            status: 400,
          }
        );
      }

      city =
        body.city.trim();

      if (city.length > 100) {
        return Response.json(
          {
            error:
              "Ville invalide.",
          },
          {
            status: 400,
          }
        );
      }
    }

    if (body.postalCode !== undefined) {
      if (!isString(body.postalCode)) {
        return Response.json(
          {
            error:
              "Code postal invalide.",
          },
          {
            status: 400,
          }
        );
      }

      postalCode =
        body.postalCode.trim();

      if (postalCode.length > 20) {
        return Response.json(
          {
            error:
              "Code postal invalide.",
          },
          {
            status: 400,
          }
        );
      }
    }

    await connectDB();

    /*
     * Check whether the email already exists.
     *
     * We don't return sensitive account information.
     */
    const existingUser =
      await User.findOne({
        email,
      }).select("_id");

    if (existingUser) {
      return Response.json(
        {
          error:
            "Cette adresse email est déjà utilisée.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * Hash the password.
     *
     * NEVER store the original password.
     */
    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );

    /*
     * IMPORTANT:
     *
     * role is deliberately NOT taken from
     * the request body.
     *
     * A user registering through this endpoint
     * can ONLY become a customer.
     */
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      city,
      postalCode,
      role: "customer",
    });

    /*
     * Do not return:
     *
     * - password
     * - password hash
     * - the complete user document
     *
     * The client only needs confirmation.
     */
    return Response.json(
      {
        message:
          "Compte créé avec succès.",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "REGISTER ERROR:",
      error
    );

    /*
     * MongoDB duplicate-key error.
     *
     * This can happen if two registration requests
     * with the same email arrive simultaneously.
     */
    if (
      error instanceof mongoose.Error &&
      "code" in error &&
      error.code === 11000
    ) {
      return Response.json(
        {
          error:
            "Cette adresse email est déjà utilisée.",
        },
        {
          status: 409,
        }
      );
    }

    return Response.json(
      {
        error:
          "Une erreur est survenue lors de la création du compte.",
      },
      {
        status: 500,
      }
    );
  }
}