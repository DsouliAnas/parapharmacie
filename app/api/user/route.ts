import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

interface UpdateUserBody {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export async function GET() {
  try {
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

    await connectDB();

    const user = await User.findById(session.user.id).select(
      "-password"
    );

    if (!user) {
      return Response.json(
        {
          error: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(user);
  } catch (error) {
    console.error("GET USER ERROR:", error);

    return Response.json(
      {
        error: "Failed to get user",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
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

    await connectDB();

    const body = (await request.json()) as UpdateUserBody;

    const user = await User.findById(session.user.id);

    if (!user) {
      return Response.json(
        {
          error: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * PASSWORD CHANGE
     *
     * A password change requires:
     * - current password
     * - new password
     * - confirmation
     */
    const wantsPasswordChange =
      Boolean(body.currentPassword) ||
      Boolean(body.newPassword) ||
      Boolean(body.confirmPassword);

    if (wantsPasswordChange) {
      if (
        !body.currentPassword ||
        !body.newPassword ||
        !body.confirmPassword
      ) {
        return Response.json(
          {
            error:
              "Le mot de passe actuel, le nouveau mot de passe et sa confirmation sont obligatoires.",
          },
          {
            status: 400,
          }
        );
      }

      if (body.newPassword !== body.confirmPassword) {
        return Response.json(
          {
            error:
              "La confirmation du nouveau mot de passe ne correspond pas.",
          },
          {
            status: 400,
          }
        );
      }

      if (body.newPassword.length < 8) {
        return Response.json(
          {
            error:
              "Le nouveau mot de passe doit contenir au moins 8 caractères.",
          },
          {
            status: 400,
          }
        );
      }

      const passwordIsCorrect = await bcrypt.compare(
        body.currentPassword,
        user.password
      );

      if (!passwordIsCorrect) {
        return Response.json(
          {
            error: "Le mot de passe actuel est incorrect.",
          },
          {
            status: 400,
          }
        );
      }

      user.password = await bcrypt.hash(
        body.newPassword,
        12
      );
    }

    /*
     * PROFILE UPDATE
     *
     * Only allow fields that customers are actually
     * allowed to modify.
     *
     * Never accept:
     * - role
     * - email
     * - user ID
     */
    if (typeof body.name === "string") {
      const name = body.name.trim();

      if (!name) {
        return Response.json(
          {
            error: "Le nom ne peut pas être vide.",
          },
          {
            status: 400,
          }
        );
      }

      user.name = name;
    }

    if (typeof body.phone === "string") {
      user.phone = body.phone.trim();
    }

    if (typeof body.address === "string") {
      user.address = body.address.trim();
    }

    if (typeof body.city === "string") {
      user.city = body.city.trim();
    }

    if (typeof body.postalCode === "string") {
      user.postalCode = body.postalCode.trim();
    }

    await user.save();

    return Response.json({
      message: wantsPasswordChange
        ? "Profil et mot de passe mis à jour."
        : "Profil mis à jour.",
    });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);

    return Response.json(
      {
        error: "Failed to update user",
      },
      {
        status: 500,
      }
    );
  }
}