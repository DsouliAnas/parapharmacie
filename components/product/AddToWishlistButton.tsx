"use client";

import { useState } from "react";

interface AddToWishlistButtonProps {
  productId: string;
}

interface WishlistResponse {
  message?: string;
  error?: string;
}

export default function AddToWishlistButton({
  productId,
}: AddToWishlistButtonProps): React.ReactElement {
  const [saved, setSaved] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  async function addWishlist(): Promise<void> {
    if (loading || saved) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response: Response = await fetch(
        "/api/wishlist",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product: productId,
          }),
        }
      );

      let data: WishlistResponse = {};

      try {
        data =
          (await response.json()) as WishlistResponse;
      } catch {
        data = {};
      }

      if (response.ok) {
        setSaved(true);
        return;
      }

      if (response.status === 401) {
        setError("Connectez-vous pour ajouter aux favoris.");
        return;
      }

      if (response.status === 409) {
        /*
         * Product is probably already in the wishlist.
         */
        setSaved(true);
        return;
      }

      setError(
        data.error ??
          "Impossible d'ajouter le produit aux favoris."
      );
    } catch (error: unknown) {
      console.error(
        "ADD TO WISHLIST ERROR:",
        error
      );

      setError(
        "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={addWishlist}
        disabled={loading || saved}
        aria-pressed={saved}
        className={`
          rounded-full
          border
          px-6
          py-3
          font-medium
          transition
          ${
            saved
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-[#7C8B73] bg-white text-[#7C8B73] hover:bg-[#7C8B73] hover:text-white"
          }
          ${
            loading
              ? "cursor-wait opacity-60"
              : ""
          }
          ${
            saved
              ? "cursor-default"
              : ""
          }
        `}
      >
        {loading ? (
          "Ajout..."
        ) : saved ? (
          "❤️ Ajouté aux favoris"
        ) : (
          "♡ Ajouter aux favoris"
        )}
      </button>

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}