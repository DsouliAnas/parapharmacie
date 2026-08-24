"use client";

import { useEffect, useState } from "react";

interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

interface ReviewsListProps {
  productId: string;
}

export default function ReviewsList({
  productId,
}: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadReviews(): Promise<void> {
      if (!productId) {
        if (!cancelled) {
          setReviews([]);
          setLoading(false);
        }

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/reviews?productId=${encodeURIComponent(productId)}`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          if (!cancelled) {
            setReviews([]);
            setError("Impossible de charger les avis.");
          }

          return;
        }

        const data: unknown = await response.json();

        if (!Array.isArray(data)) {
          if (!cancelled) {
            setReviews([]);
            setError("Réponse invalide du serveur.");
          }

          return;
        }

        const validReviews: Review[] = data.filter(
          (item): item is Review => {
            if (
              typeof item !== "object" ||
              item === null
            ) {
              return false;
            }

            const review = item as Record<
              string,
              unknown
            >;

            return (
              typeof review._id === "string" &&
              typeof review.name === "string" &&
              typeof review.rating === "number" &&
              typeof review.comment === "string"
            );
          }
        );

        if (!cancelled) {
          setReviews(validReviews);
        }
      } catch (error) {
        console.error(
          "REVIEWS LOAD ERROR:",
          error
        );

        if (!cancelled) {
          setReviews([]);
          setError(
            "Une erreur est survenue lors du chargement des avis."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadReviews();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (loading) {
    return (
      <div
        className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        aria-live="polite"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-32 rounded bg-gray-200" />
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-4/5 rounded bg-gray-200" />
        </div>

        <p className="sr-only">
          Chargement des avis...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center"
        role="alert"
      >
        <p className="text-sm font-medium text-red-600">
          {error}
        </p>

        <button
          type="button"
          onClick={() => {
            window.location.reload();
          }}
          className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-8">
        <div
          className="text-4xl"
          aria-hidden="true"
        >
          💬
        </div>

        <p className="mt-4 font-medium text-gray-700">
          Aucun avis pour ce produit.
        </p>

        <p className="mt-2 text-sm text-gray-400">
          Soyez le premier à donner votre avis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const normalizedRating = Math.min(
          5,
          Math.max(
            0,
            Math.round(review.rating)
          )
        );

        const reviewerName =
          review.name.trim() || "Client";

        const comment =
          review.comment.trim();

        return (
          <article
            key={review._id}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"
          >
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="break-words font-semibold text-gray-900">
                {reviewerName}
              </h3>

              {review.createdAt && (
                <time
                  dateTime={review.createdAt}
                  className="text-xs text-gray-400"
                >
                  {new Date(
                    review.createdAt
                  ).toLocaleDateString(
                    "fr-FR"
                  )}
                </time>
              )}
            </div>

            {/* Rating */}
            <div
              className="mt-3 flex items-center gap-2"
              aria-label={`${normalizedRating} sur 5 étoiles`}
            >
              <span
                className="text-lg tracking-wide text-yellow-500"
                aria-hidden="true"
              >
                {"★".repeat(
                  normalizedRating
                )}
                {"☆".repeat(
                  5 - normalizedRating
                )}
              </span>

              <span className="text-sm font-medium text-gray-600">
                {normalizedRating}/5
              </span>
            </div>

            {/* Comment */}
            {comment && (
              <p className="mt-4 break-words whitespace-pre-line leading-6 text-gray-600">
                {comment}
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}