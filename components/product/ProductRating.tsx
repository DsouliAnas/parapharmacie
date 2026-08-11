interface ProductRatingProps {
  rating: number;
  count: number;
}

export default function ProductRating({
  rating,
  count,
}: ProductRatingProps) {
  const roundedRating = Math.min(
    5,
    Math.max(0, Math.round(rating))
  );

  return (
    <div>
      <div className="flex items-center gap-3">
        <div
          className="text-xl tracking-wide text-yellow-500"
          aria-label={`${rating.toFixed(1)} sur 5`}
        >
          {"★".repeat(roundedRating)}
          {"☆".repeat(5 - roundedRating)}
        </div>

        <span className="font-semibold text-gray-800">
          {rating.toFixed(1)}
        </span>
      </div>

      <p className="mt-2 text-sm text-gray-500">
        {count === 0
          ? "Aucun avis"
          : `${count} ${count > 1 ? "avis" : "avis"}`}
      </p>
    </div>
  );
}