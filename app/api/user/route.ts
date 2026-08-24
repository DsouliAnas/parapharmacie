import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

interface ProfileUpdateBody {
  name?: unknown;
  phone?: unknown;
  address?: unknown;
  city?: unknown;
  postalCode?: unknown;
}

interface PasswordUpdateBody {
  currentPassword?: unknown;
  newPassword?: unknown;
  confirmPassword?: unknown;
}

const MAX_NAME_LENGTH = 100;
const MAX_PHONE_LENGTH = 30;
const MAX_ADDRESS_LENGTH = 250;
const MAX_CITY_LENGTH = 100;
const MAX_POSTAL_CODE_LENGTH = 20;
const MAX_PASSWORD_LENGTH = 128;

function isPlainObject(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isValidString(
  value: unknown,
  maxLength: number
): value is string {
  return (
    typeof value === "string" &&
    value.length <= maxLength
  );
}

function containsControlCharacters(value: string): boolean {
  return /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(
    value
  );
}

function cleanText(
  value: string,
  maxLength: number
): string | null {
  const cleaned = value.trim();

  if (!cleaned) {
    return null;
  }

  if (cleaned.length > maxLength) {
    return null;
  }

  if (containsControlCharacters(cleaned)) {
    return null;
  }

  return cleaned;
}

function isStrongEnoughPassword(
  password: string
): boolean {
  if (
    password.length < 8 ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    return false;
  }

  return true;
}

function jsonError(
  error: string,
  status: number
) {
  return Response.json(
    { error },
    { status }
  );
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return jsonError(
        "Not authenticated",
        401
      );
    }

    await connectDB();

    const user = await User.findById(
      session.user.id
    )
      .select(
        "_id name email phone address city postalCode"
      )
      .lean();

    if (!user) {
      return jsonError(
        "User not found",
        404
      );
    }

    return Response.json(user);
  } catch (error) {
    console.error("GET USER ERROR:", error);

    return jsonError(
      "Failed to get user",
      500
    );
  }
}

export async function PATCH(
  request: NextRequest
) {
  try {
    const session = await getServerSession(
      authOptions
    );

    if (!session?.user?.id) {
      return jsonError(
        "Not authenticated",
        401
      );
    }

    /*
     * Reject unexpectedly large request bodies.
     *
     * This is not a replacement for a real rate limiter,
     * but it prevents someone from sending unnecessarily
     * huge JSON payloads to this endpoint.
     */
    const contentLength =
      request.headers.get("content-length");

    if (
      contentLength &&
      Number(contentLength) > 20_000
    ) {
      return jsonError(
        "Request too large.",
        413
      );
    }

    let rawBody: unknown;

    try {
      rawBody = await request.json();
    } catch {
      return jsonError(
        "Invalid JSON body.",
        400
      );
    }

    if (!isPlainObject(rawBody)) {
      return jsonError(
        "Invalid request body.",
        400
      );
    }

    await connectDB();

    const user = await User.findById(
      session.user.id
    );

    if (!user) {
      return jsonError(
        "User not found",
        404
      );
    }

    /*
     * Determine which operation the client is requesting.
     */
    const hasPasswordFields =
      "currentPassword" in rawBody ||
      "newPassword" in rawBody ||
      "confirmPassword" in rawBody;

    const hasProfileFields =
      "name" in rawBody ||
      "phone" in rawBody ||
      "address" in rawBody ||
      "city" in rawBody ||
      "postalCode" in rawBody;

    /*
     * Do not allow profile changes and password changes
     * in the same request.
     *
     * This makes the security boundary much clearer.
     */
    if (
      hasPasswordFields &&
      hasProfileFields
    ) {
      return jsonError(
        "Veuillez modifier le profil et le mot de passe séparément.",
        400
      );
    }

    /*
     * =========================
     * PASSWORD CHANGE
     * =========================
     */
    if (hasPasswordFields) {
      const body =
        rawBody as PasswordUpdateBody;

      if (
        typeof body.currentPassword !==
          "string" ||
        typeof body.newPassword !==
          "string" ||
        typeof body.confirmPassword !==
          "string"
      ) {
        return jsonError(
          "Les trois champs du mot de passe sont obligatoires.",
          400
        );
      }

      if (
        body.currentPassword.length >
          MAX_PASSWORD_LENGTH ||
        body.newPassword.length >
          MAX_PASSWORD_LENGTH ||
        body.confirmPassword.length >
          MAX_PASSWORD_LENGTH
      ) {
        return jsonError(
          "Mot de passe invalide.",
          400
        );
      }

      if (
        !body.currentPassword ||
        !body.newPassword ||
        !body.confirmPassword
      ) {
        return jsonError(
          "Les trois champs du mot de passe sont obligatoires.",
          400
        );
      }

      if (
        body.newPassword !==
        body.confirmPassword
      ) {
        return jsonError(
          "La confirmation du nouveau mot de passe ne correspond pas.",
          400
        );
      }

      if (
        !isStrongEnoughPassword(
          body.newPassword
        )
      ) {
        return jsonError(
          "Le nouveau mot de passe doit contenir entre 8 et 128 caractères.",
          400
        );
      }

      /*
       * Do not allow the user to reuse the same password.
       */
      const passwordIsSame =
        await bcrypt.compare(
          body.newPassword,
          user.password
        );

      if (passwordIsSame) {
        return jsonError(
          "Le nouveau mot de passe doit être différent de l'ancien.",
          400
        );
      }

      const passwordIsCorrect =
        await bcrypt.compare(
          body.currentPassword,
          user.password
        );

      if (!passwordIsCorrect) {
        /*
         * 401 is preferable here because the current
         * authentication credential is invalid.
         */
        return jsonError(
          "Le mot de passe actuel est incorrect.",
          401
        );
      }

      user.password =
        await bcrypt.hash(
          body.newPassword,
          12
        );

      await user.save();

      return Response.json({
        message:
          "Votre mot de passe a été modifié avec succès.",
      });
    }

    /*
     * =========================
     * PROFILE UPDATE
     * =========================
     */

    if (!hasProfileFields) {
      return jsonError(
        "Aucune modification fournie.",
        400
      );
    }

    const body =
      rawBody as ProfileUpdateBody;

    /*
     * Reject unknown fields.
     *
     * This prevents accidental future mass-assignment
     * vulnerabilities such as:
     *
     * { role: "admin" }
     *
     * or
     *
     * { email: "..." }
     */
    const allowedFields = new Set([
      "name",
      "phone",
      "address",
      "city",
      "postalCode",
    ]);

    for (const key of Object.keys(body)) {
      if (!allowedFields.has(key)) {
        return jsonError(
          "Champ non autorisé.",
          400
        );
      }
    }

    if ("name" in body) {
      if (
        !isValidString(
          body.name,
          MAX_NAME_LENGTH
        )
      ) {
        return jsonError(
          "Nom invalide.",
          400
        );
      }

      const name = cleanText(
        body.name,
        MAX_NAME_LENGTH
      );

      if (!name) {
        return jsonError(
          "Le nom ne peut pas être vide.",
          400
        );
      }

      user.name = name;
    }

    if ("phone" in body) {
      if (
        !isValidString(
          body.phone,
          MAX_PHONE_LENGTH
        )
      ) {
        return jsonError(
          "Numéro de téléphone invalide.",
          400
        );
      }

      const phone = body.phone.trim();

      if (
        phone &&
        !/^[0-9+\s().-]+$/.test(phone)
      ) {
        return jsonError(
          "Numéro de téléphone invalide.",
          400
        );
      }

      user.phone = phone;
    }

    if ("address" in body) {
      if (
        !isValidString(
          body.address,
          MAX_ADDRESS_LENGTH
        )
      ) {
        return jsonError(
          "Adresse invalide.",
          400
        );
      }

      const address = body.address.trim();

      user.address = address;
    }

    if ("city" in body) {
      if (
        !isValidString(
          body.city,
          MAX_CITY_LENGTH
        )
      ) {
        return jsonError(
          "Ville invalide.",
          400
        );
      }

      user.city = body.city.trim();
    }

    if ("postalCode" in body) {
      if (
        !isValidString(
          body.postalCode,
          MAX_POSTAL_CODE_LENGTH
        )
      ) {
        return jsonError(
          "Code postal invalide.",
          400
        );
      }

      const postalCode =
        body.postalCode.trim();

      if (
        postalCode &&
        !/^[0-9A-Za-zÀ-ÿ\s-]+$/.test(
          postalCode
        )
      ) {
        return jsonError(
          "Code postal invalide.",
          400
        );
      }

      user.postalCode = postalCode;
    }

    await user.save();

    return Response.json({
      message:
        "Profil mis à jour avec succès.",
    });
  } catch (error) {
    console.error(
      "UPDATE USER ERROR:",
      error
    );

    return jsonError(
      "Impossible de mettre à jour le compte.",
      500
    );
  }
}