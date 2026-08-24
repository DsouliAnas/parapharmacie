"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface ReviewFormProps {
  productId: string;
}

interface ReviewResponse {
  error?: string;
  message?: string;
}

const MAX_COMMENT_LENGTH = 1000;

export default function ReviewForm({
  productId,
}: ReviewFormProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | ""
  >("");

  const isAuthenticated =
    status === "authenticated" &&
    Boolean(session?.user?.id);

  const remainingCharacters =
    MAX_COMMENT_LENGTH - comment.length;

  function handleRatingChange(
    selectedRating: number
  ): void {
    if (loading || !isAuthenticated) {
      return;
    }

    setRating(selectedRating);
    setMessage("");
    setMessageType("");
  }

  function handleCommentChange(
    value: string
  ): void {
    if (value.length > MAX_COMMENT_LENGTH) {
      return;
    }

    setComment(value);

    if (messageType === "error") {
      setMessage("");
      setMessageType("");
    }
  }

  async function submitReview(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (status === "loading") {
      return;
    }

    if (!isAuthenticated) {
      setMessage(
        "Vous devez être connecté pour laisser un avis."
      );
      setMessageType("error");
      return;
    }

    const trimmedComment = comment.trim();

    if (!trimmedComment) {
      setMessage("Écrivez un commentaire.");
      setMessageType("error");
      return;
    }

    if (trimmedComment.length < 3) {
      setMessage(
        "Votre commentaire doit contenir au moins 3 caractères."
      );
      setMessageType("error");
      return;
    }

    if (trimmedComment.length > MAX_COMMENT_LENGTH) {
      setMessage(
        `Votre commentaire ne peut pas dépasser ${MAX_COMMENT_LENGTH} caractères.`
      );
      setMessageType("error");
      return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setMessage("Veuillez sélectionner une note valide.");
      setMessageType("error");
      return;
    }

    if (!productId.trim()) {
      setMessage("Produit invalide.");
      setMessageType("error");
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
          comment: trimmedComment,
        }),
      });

      let data: ReviewResponse = {};

      try {
        data = (await response.json()) as ReviewResponse;
      } catch {
        data = {};
      }

      if (!response.ok) {
        setMessage(
          data.error ??
            "Impossible d'ajouter l'avis. Veuillez réessayer."
        );
        setMessageType("error");
        return;
      }

      setComment("");
      setRating(5);
      setMessage(
        "Votre avis a été ajouté avec succès."
      );
      setMessageType("success");

      router.refresh();
    } catch (error) {
      console.error(
        "REVIEW SUBMISSION ERROR:",
        error
      );

      setMessage(
        "Une erreur est survenue. Veuillez réessayer."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div
        className="rounded-2xl border border-gray-100 bg-white p-5"
        aria-busy="true"
      >
        <h2 className="text-xl font-bold text-gray-900">
          Donner votre avis
        </h2>

        <p className="mt-3 text-sm text-gray-500">
          Vérification de votre connexion...
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submitReview}
      className="w-full"
    >
      <h2 className="text-xl font-bold text-gray-900">
        Donner votre avis
      </h2>

      {!isAuthenticated && (
        <p className="mt-2 text-sm text-gray-500">
          Connectez-vous pour laisser un avis.
        </p>
      )}

      {/* Rating */}
      <fieldset
        disabled={loading || !isAuthenticated}
        className="mt-5"
      >
        <legend className="mb-2 text-sm font-medium text-gray-700">
          Votre note
        </legend>

        <div
          className="flex items-center gap-1"
          role="radiogroup"
          aria-label="Choisir une note"
        >
          {[1, 2, 3, 4, 5].map((star) => {
            const isSelected = star === rating;
            const isFilled = star <= rating;

            return (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`${star} étoile${
                  star > 1 ? "s" : ""
                }`}
                onClick={() =>
                  handleRatingChange(star)
                }
                className="min-h-11 min-w-11 rounded-lg text-3xl transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C8B73] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span
                  aria-hidden="true"
                  className={
                    isFilled
                      ? "text-yellow-500"
                      : "text-gray-300"
                  }
                >
                  {isFilled ? "★" : "☆"}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Comment */}
      <div className="mt-5">
        <label
          htmlFor="review-comment"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Votre commentaire
        </label>

        <textarea
          id="review-comment"
          value={comment}
          onChange={(event) =>
            handleCommentChange(event.target.value)
          }
          disabled={loading || !isAuthenticated}
          required
          minLength={3}
          maxLength={MAX_COMMENT_LENGTH}
          rows={5}
          placeholder={
            isAuthenticated
              ? "Partagez votre expérience avec ce produit..."
              : "Connectez-vous pour écrire un avis..."
          }
          aria-describedby="review-character-count"
          className="w-full resize-y rounded-2xl border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7C8B73] focus:ring-2 focus:ring-[#7C8B73]/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
        />

        <div
          id="review-character-count"
          className={`mt-2 text-right text-xs ${
            remainingCharacters < 100
              ? "text-orange-500"
              : "text-gray-400"
          }`}
        >
          {comment.length} / {MAX_COMMENT_LENGTH}
        </div>
      </div>

      {/* Message */}
      {message && (
        <p
          role="alert"
          className={`mt-3 rounded-xl px-4 py-3 text-sm ${
            messageType === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={
          loading ||
          !isAuthenticated ||
          !comment.trim()
        }
        className="mt-5 min-h-12 w-full rounded-full bg-[#7C8B73] px-7 py-3 font-semibold text-white transition hover:bg-[#66745F] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C8B73] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto"
      >
        {loading
          ? "Envoi..."
          : "Publier mon avis"}
      </button>
    </form>
  );
}