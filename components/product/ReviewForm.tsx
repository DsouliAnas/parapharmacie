"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface ReviewFormProps {
  productId: string;
}

export default function ReviewForm({
  productId,
}: ReviewFormProps) {
  const { data: session, status } = useSession();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submitReview() {
    setMessage("");

    if (status === "loading") {
      return;
    }

    if (!session?.user?.id) {
      setMessage(
        "Vous devez être connecté pour laisser un avis."
      );
      return;
    }

    if (!comment.trim()) {
      setMessage("Écrivez un commentaire.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product: productId,
          rating,
          comment: comment.trim(),
        }),
      });

      const data: { error?: string } =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.error || "Impossible d'ajouter l'avis."
        );
        return;
      }

      setComment("");
      setRating(5);
      setMessage("Votre avis a été ajouté avec succès.");

      window.location.reload();
    } catch (error) {
      console.error("Review submission error:", error);

      setMessage(
        "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">
        Donner votre avis
      </h2>

      {!session?.user?.id && status !== "loading" && (
        <p className="mt-2 text-sm text-gray-500">
          Connectez-vous pour laisser un avis.
        </p>
      )}

      {/* Stars */}
      <div className="mt-5 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            disabled={loading}
            aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
            className="text-3xl transition hover:scale-110 disabled:cursor-not-allowed"
          >
            <span
              className={
                star <= rating
                  ? "text-yellow-500"
                  : "text-gray-300"
              }
            >
              ★
            </span>
          </button>
        ))}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(event) =>
          setComment(event.target.value)
        }
        disabled={loading}
        rows={5}
        placeholder="Partagez votre expérience avec ce produit..."
        className="mt-5 w-full rounded-2xl border border-gray-200 bg-white p-4 text-sm outline-none transition focus:border-[#7C8B73] disabled:bg-gray-100"
      />

      {/* Message */}
      {message && (
        <p className="mt-3 text-sm text-gray-600">
          {message}
        </p>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={submitReview}
        disabled={loading || status === "loading"}
        className="mt-5 rounded-full bg-[#7C8B73] px-7 py-3 font-semibold text-white transition hover:bg-[#66745F] disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {loading ? "Envoi..." : "Publier mon avis"}
      </button>
    </div>
  );
}