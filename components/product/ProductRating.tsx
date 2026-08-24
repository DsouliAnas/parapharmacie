interface ProductRatingProps {
  rating: number;
  count: number;
}

export default function ProductRating({
  rating,
  count,
}: ProductRatingProps): React.ReactElement {
  /*
   * Make sure the rating is always between 0 and 5.
   */
  const safeRating: number = Number.isFinite(rating)
    ? Math.min(5, Math.max(0, rating))
    : 0;

  /*
   * Make sure the review count cannot be negative.
   */
  const safeCount: number = Number.isFinite(count)
    ? Math.max(0, Math.floor(count))
    : 0;

  /*
   * Round only for the visual star display.
   */
  const roundedRating: number = Math.round(safeRating);

  const reviewLabel: string =
    safeCount === 0
      ? "Aucun avis"
      : safeCount === 1
        ? "1 avis"
        : `${safeCount} avis`;

  return (
    <div
      className="min-w-0"
      aria-label={`Note ${safeRating.toFixed(1)} sur 5, ${reviewLabel}`}
    >
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Stars */}
        <div
          aria-hidden="true"
          className="
            text-lg
            tracking-wide
            text-yellow-500
            sm:text-xl
          "
        >
          {"★".repeat(roundedRating)}
          {"☆".repeat(5 - roundedRating)}
        </div>

        {/* Numeric rating */}
        <span className="text-sm font-semibold text-gray-800 sm:text-base">
          {safeRating.toFixed(1)}
          <span className="ml-1 font-normal text-gray-400">
            / 5
          </span>
        </span>
      </div>

      {/* Review count */}
      <p className="mt-1.5 text-xs text-gray-500 sm:mt-2 sm:text-sm">
        {reviewLabel}
      </p>
    </div>
  );
}