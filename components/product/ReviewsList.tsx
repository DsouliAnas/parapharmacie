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

  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      try {
        if (!productId) {
          return;
        }

        const response = await fetch(
          `/api/reviews?productId=${encodeURIComponent(
            productId
          )}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          if (!cancelled) {
            setReviews([]);
          }

          return;
        }

        const data: Review[] = await response.json();

        if (!cancelled) {
          setReviews(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Reviews error:", error);

        if (!cancelled) {
          setReviews([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">
          Chargement des avis...
        </p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-gray-500">
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
        const rating = Math.min(
          5,
          Math.max(0, review.rating)
        );

        return (
          <article
            key={review._id}
            className="rounded-2xl bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-semibold text-gray-900">
                {review.name || "Client"}
              </h3>

              {review.createdAt && (
                <span className="text-xs text-gray-400">
                  {new Date(
                    review.createdAt
                  ).toLocaleDateString("fr-FR")}
                </span>
              )}
            </div>

            <div className="mt-2 text-yellow-500">
              {"★".repeat(rating)}
              {"☆".repeat(5 - rating)}
            </div>

            <p className="mt-4 leading-6 text-gray-600">
              {review.comment}
            </p>
          </article>
        );
      })}
    </div>
  );
}